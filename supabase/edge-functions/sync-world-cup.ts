import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

const FD_BASE = "https://api.football-data.org/v4";

const WORLD_CUP_COMPETITION = {
  name: "FIFA World Cup",
  code: "WC",
  type: "CUP",
};

const STAGE_ORDER = [
  "QUALIFICATION",
  "GROUP_STAGE",
  "LAST_32",
  "LAST_16",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "THIRD_PLACE",
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

async function getWorldCupProgress(
  fdKey: string,
): Promise<{
  current_stage: string | null;
  current_fixture: number | null;
  total_fixtures: number | null;
}> {
  const res = await fetch(`${FD_BASE}/competitions/WC/matches`, {
    headers: {
      "X-Auth-Token": fdKey,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    console.warn(`⚠️ Failed to fetch World Cup matches: ${res.status}`);

    return {
      current_stage: null,
      current_fixture: null,
      total_fixtures: null,
    };
  }

  const payload = await res.json();
  const matches = Array.isArray(payload?.matches) ? payload.matches : [];
  const total_fixtures = matches.length;

  if (matches.length === 0) {
    return {
      current_stage: null,
      current_fixture: null,
      total_fixtures: 0,
    };
  }

  const startedMatches = matches.filter((match: any) => {
    const status = match?.status;

    return status !== "SCHEDULED" ;
  });

  /**
   * אם אף משחק עוד לא התחיל:
   * לא אוספים את כל השלבים מהלו״ז,
   * כי אז זה כולל גם FINAL והקוד יחשוב שהטורניר בגמר.
   */
  if (startedMatches.length === 0) {
    const firstUpcomingMatch = matches.find((match: any) => match?.stage);

    const firstStage = firstUpcomingMatch?.stage ?? null;

    return {
      current_stage: firstStage,
      current_fixture:
        firstStage === "GROUP_STAGE"
          ? firstUpcomingMatch?.matchday ?? 1
          : null,
      total_fixtures,
    };
  }

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
   * אם משום מה stage לא נמצא בתוך STAGE_ORDER,
   * ניקח את השלב של המשחק האחרון שהתחיל.
   */
  if (!current_stage) {
    const lastStartedMatch = startedMatches[startedMatches.length - 1];
    current_stage = lastStartedMatch?.stage ?? null;
  }

  let current_fixture: number | null = null;

  /**
   * בגביע העולם fixture/matchday רלוונטי בעיקר לשלב הבתים.
   */
  if (current_stage === "GROUP_STAGE") {
    const groupStageStartedMatches = startedMatches.filter(
      (match: any) => match?.stage === "GROUP_STAGE",
    );

    const playedMatchdays = new Set<number>();

    for (const match of groupStageStartedMatches) {
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

async function syncWorldCup(
  supabase: ReturnType<typeof createClient>,
  fdKey: string,
) {
  const { data: existingComp } = await supabase
    .from("competitions")
    .select("total_fixtures, current_fixture, current_stage, logo")
    .eq("code", "WC")
    .maybeSingle();

  const compRes = await fetch(`${FD_BASE}/competitions/WC`, {
    headers: {
      "X-Auth-Token": fdKey,
      Accept: "application/json",
    },
  });

  if (!compRes.ok) {
    throw new Error(`Failed to fetch World Cup competition: ${compRes.status}`);
  }

  const apiComp = await compRes.json();

  let logoUrlStored: string | null = null;

  /**
   * בגביע העולם אין flag, כי area זה World וה־flag הוא null.
   * לכן שומרים רק את emblem בתור logo.
   */
  if (apiComp.emblem) {
    try {
      const file = await downloadImage(apiComp.emblem);

      logoUrlStored = await uploadToBucket(
        supabase,
        "competitions_logo",
        apiComp.code ?? WORLD_CUP_COMPETITION.code,
        file,
      );
    } catch (error) {
      console.warn("⚠️ Failed to store World Cup emblem:", error);
    }
  }

  const season = apiComp.currentSeason ?? null;
  const progress = await getWorldCupProgress(fdKey);

  const newComp = {
    id: apiComp.id,
    name: WORLD_CUP_COMPETITION.name,
    code: WORLD_CUP_COMPETITION.code,
    type: apiComp.type ?? WORLD_CUP_COMPETITION.type,

    /**
     * אם ההורדה של הלוגו נכשלה,
     * לא נדרוס logo קיים ל־null.
     */
    logo: logoUrlStored ?? existingComp?.logo ?? null,

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

    const worldCup = await syncWorldCup(supabase, FD_KEY);

    return new Response(
      JSON.stringify({
        success: true,
        message: "World Cup synced successfully",
        competition: worldCup,
      }),
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("❌ World Cup sync failed:", error);

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