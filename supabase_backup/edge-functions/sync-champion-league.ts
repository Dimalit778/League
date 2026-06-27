import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

const FD_BASE = "https://api.football-data.org/v4";

const CHAMPIONS_LEAGUE_COMPETITION = {
  name: "UEFA Champions League",
  code: "CL",
  type: "CUP",
};

const STAGE_ORDER = [
  "QUALIFICATION",
  "QUALIFICATION_ROUND_1",
  "QUALIFICATION_ROUND_2",
  "QUALIFICATION_ROUND_3",
  "PLAYOFF_ROUND_1",
  "PLAYOFF_ROUND_2",
  "PLAYOFFS",

  "LEAGUE_STAGE",

  "LAST_32",
  "LAST_16",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "FINAL",
] as const;

const nowIso = () => new Date().toISOString();

const must = (key: string) => {
  const value = Deno.env.get(key);

  if (!value) {
    throw new Error(`${key} is not set`);
  }

  return value;
};

function inferExtFromContentType(ct: string | undefined): string {
  if (!ct) return "png";

  const lower = ct.toLowerCase();

  if (lower.includes("svg")) return "svg";
  if (lower.includes("webp")) return "webp";
  if (lower.includes("jpeg")) return "jpg";
  if (lower.includes("png")) return "png";

  return "png";
}

function inferExtFromUrl(url: string): string | null {
  const match = url.toLowerCase().match(/\.(svg|png|webp|jpe?g)(?:\?|#|$)/);

  return match?.[1] ?? null;
}

async function downloadImage(url: string) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to download image ${res.status} for ${url}`);
  }

  const buf = new Uint8Array(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || undefined;
  const ext = inferExtFromUrl(url) ?? inferExtFromContentType(contentType);

  return {
    buf,
    contentType: contentType ?? "application/octet-stream",
    ext,
  };
}

async function uploadToBucket(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  pathNoExt: string,
  payload: {
    buf: Uint8Array;
    contentType: string;
    ext: string;
  },
) {
  const path = `${pathNoExt}.${payload.ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, payload.buf, {
    contentType: payload.contentType,
    upsert: true,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
}

async function getChampionsLeagueProgress(
  fdKey: string,
): Promise<{
  current_stage: string | null;
  current_fixture: number | null;
  total_fixtures: number | null;
}> {
  const res = await fetch(`${FD_BASE}/competitions/CL/matches`, {
    headers: {
      "X-Auth-Token": fdKey,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    console.warn(`⚠️ Failed to fetch Champions League matches: ${res.status}`);

    return {
      current_stage: null,
      current_fixture: null,
      total_fixtures: null,
    };
  }

  const payload = await res.json();
  const matches = Array.isArray(payload?.matches) ? payload.matches : [];

  /**
   * חשוב:
   * בליגת האלופות matches.length סופר את כל המשחקים:
   * League Stage + Playoffs + Knockout.
   *
   * לכן זה יכול להחזיר 104.
   *
   * אבל total_fixtures אצלך אמור לייצג את מספר המחזורים בדף,
   * וב־Champions League יש 8 מחזורי League Stage.
   */
  const leagueStageMatchdays = new Set<number>();

  for (const match of matches) {
    if (
      match?.stage === "LEAGUE_STAGE" &&
      typeof match?.matchday === "number"
    ) {
      leagueStageMatchdays.add(match.matchday);
    }
  }

  const total_fixtures =
    leagueStageMatchdays.size > 0
      ? Math.max(...leagueStageMatchdays)
      : matches.length;

  if (matches.length === 0) {
    return {
      current_stage: null,
      current_fixture: null,
      total_fixtures: 0,
    };
  }

  const startedMatches = matches.filter((match: any) => {
    const status = match?.status;

    return status !== "SCHEDULED";
  });

  /**
   * אם אף משחק עוד לא התחיל:
   * לא אוספים את כל השלבים מהלו״ז,
   * כי אז זה יכול לכלול גם FINAL.
   * במקום זה לוקחים את המשחק הראשון בלוח.
   */
  if (startedMatches.length === 0) {
    const firstUpcomingMatch = matches.find((match: any) => match?.stage);
    const firstStage = firstUpcomingMatch?.stage ?? null;

    return {
      current_stage: firstStage,
      current_fixture:
        firstStage === "LEAGUE_STAGE"
          ? firstUpcomingMatch?.matchday ?? 1
          : null,
      total_fixtures,
    };
  }

  /**
   * נאסוף רק שלבים של משחקים שבאמת התחילו.
   */
  const activeStages = new Set<string>();

  for (const match of startedMatches) {
    const stage = match?.stage;

    if (stage) {
      activeStages.add(stage);
    }
  }

  let current_stage: string | null = null;

  /**
   * עובר מהשלב המוקדם למתקדם.
   * אם התחילו כמה שלבים, האחרון שנמצא הוא השלב הכי מתקדם.
   */
  for (const stage of STAGE_ORDER) {
    if (activeStages.has(stage)) {
      current_stage = stage;
    }
  }

  /**
   * fallback:
   * אם stage לא נמצא בתוך STAGE_ORDER,
   * ניקח את השלב של המשחק האחרון שהתחיל.
   */
  if (!current_stage) {
    const lastStartedMatch = startedMatches[startedMatches.length - 1];
    current_stage = lastStartedMatch?.stage ?? null;
  }

  let current_fixture: number | null = null;

  /**
   * בליגת האלופות fixture/matchday רלוונטי ל־LEAGUE_STAGE.
   * בשלבי נוקאאוט עדיף לעבוד לפי current_stage ולא לפי fixture.
   */
  if (current_stage === "LEAGUE_STAGE") {
    const leagueStageStartedMatches = startedMatches.filter(
      (match: any) => match?.stage === "LEAGUE_STAGE",
    );

    const playedMatchdays = new Set<number>();

    for (const match of leagueStageStartedMatches) {
      const matchday = match?.matchday;

      if (typeof matchday === "number") {
        playedMatchdays.add(matchday);
      }
    }

    current_fixture =
      playedMatchdays.size > 0 ? Math.max(...playedMatchdays) : 1;
  }

  return {
    current_stage,
    current_fixture,
    total_fixtures,
  };
}

async function syncChampionsLeague(
  supabase: ReturnType<typeof createClient>,
  fdKey: string,
) {
  const { data: existingComp } = await supabase
    .from("competitions")
    .select("total_fixtures, current_fixture, current_stage, logo, flag")
    .eq("code", "CL")
    .maybeSingle();

  const compRes = await fetch(`${FD_BASE}/competitions/CL`, {
    headers: {
      "X-Auth-Token": fdKey,
      Accept: "application/json",
    },
  });

  if (!compRes.ok) {
    throw new Error(
      `Failed to fetch Champions League competition: ${compRes.status}`,
    );
  }

  const apiComp = await compRes.json();

  let logoUrlStored: string | null = null;
  let flagUrlStored: string | null = null;

  /**
   * שמירת emblem של התחרות בתור logo.
   */
  if (apiComp.emblem) {
    try {
      const file = await downloadImage(apiComp.emblem);

      logoUrlStored = await uploadToBucket(
        supabase,
        "competitions_logo",
        apiComp.code ?? CHAMPIONS_LEAGUE_COMPETITION.code,
        file,
      );
    } catch (error) {
      console.warn("⚠️ Failed to store Champions League emblem:", error);
    }
  }

  /**
   * בליגת האלופות יש flag של Europe.
   */
  if (apiComp.area?.flag) {
    try {
      const file = await downloadImage(apiComp.area.flag);

      const areaCode = apiComp.area?.code ?? "EUR";

      flagUrlStored = await uploadToBucket(
        supabase,
        "flags",
        areaCode,
        file,
      );
    } catch (error) {
      console.warn("⚠️ Failed to store Champions League area flag:", error);
    }
  }

  const season = apiComp.currentSeason ?? null;
  const progress = await getChampionsLeagueProgress(fdKey);

  const newComp = {
    id: apiComp.id,
    name: CHAMPIONS_LEAGUE_COMPETITION.name,
    code: CHAMPIONS_LEAGUE_COMPETITION.code,
    type: apiComp.type ?? CHAMPIONS_LEAGUE_COMPETITION.type,

    /**
     * אם ההעלאה ל־Storage הצליחה — שומר URL מה־bucket.
     * אם ההעלאה נכשלה — לא דורס ערך קיים.
     * ואם אין ערך קיים — משתמש ב־URL הישיר מה־API כדי לא להכניס null ל־logo.
     */
    logo: logoUrlStored ?? existingComp?.logo ?? apiComp.emblem,
    flag: flagUrlStored ?? existingComp?.flag ?? apiComp.area?.flag ?? null,

    area: apiComp.area?.name ?? null,

    season_id: season?.id ?? null,
    season_start: season?.startDate ?? null,
    season_end: season?.endDate ?? null,

    current_fixture:
      progress.current_fixture ?? existingComp?.current_fixture ?? null,

    current_stage:
      progress.current_stage ?? existingComp?.current_stage ?? null,

    total_fixtures:
      progress.total_fixtures ?? existingComp?.total_fixtures ?? null,

    updated_at: nowIso(),
  };

  const { error } = await supabase
    .from("competitions")
    .upsert(newComp, { onConflict: "id" });

  if (error) {
    throw error;
  }

  return newComp;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const SUPABASE_URL = must("SUPABASE_URL");
    const SERVICE_ROLE = must("SUPABASE_SERVICE_ROLE_KEY");
    const FD_KEY = must("FOOTBALL_ORG_API_KEY");

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const championsLeague = await syncChampionsLeague(supabase, FD_KEY);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Champions League synced successfully",
        competition: championsLeague,
      }),
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("❌ Champions League sync failed:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});