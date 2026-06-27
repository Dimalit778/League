import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const FD_BASE = "https://api.football-data.org/v4";
const FD_KEY = Deno.env.get("FOOTBALL_ORG_API_KEY") ?? "";

const TARGET_COMPETITIONS = [
  { name: "Premier League",   code: "PL",  type: "LEAGUE" },
  { name: "La Liga",          code: "PD",  type: "LEAGUE" },
  { name: "Serie A",          code: "SA",  type: "LEAGUE" },
  { name: "Bundesliga",       code: "BL1", type: "LEAGUE" },
  { name: "Ligue 1",          code: "FL1", type: "LEAGUE" },
  { name: "Champions League", code: "CL",  type: "CUP" },
  { name: "FIFA World Cup",   code: "WC",  type: "CUP" },
];

const LEAGUE_AREA_IDS = "2072,2088,2114,2081,2224";
const CUP_CODES = ["CL", "WC"];

// Stage order from earliest to latest in tournament progression.
const STAGE_ORDER = [
  "PRELIMINARY_ROUND",
  "QUALIFICATION_ROUND_1", "QUALIFICATION_ROUND_2", "QUALIFICATION_ROUND_3",
  "PLAYOFF_ROUND_1", "PLAYOFF_ROUND_2", "PLAYOFFS",
  "LEAGUE_STAGE",
  "GROUP_STAGE",
  "LAST_64", "LAST_32", "LAST_16",
  "QUARTER_FINALS", "SEMI_FINALS",
  "THIRD_PLACE", "FINAL"
];

const nowIso = () => new Date().toISOString();

function inferExtFromContentType(ct: string | undefined): string {
  if (!ct) return "png";
  if (ct.includes("svg")) return "svg";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("jpeg")) return "jpg";
  return "png";
}

function inferExtFromUrl(url: string): string | null {
  const m = url.toLowerCase().match(/\.(svg|png|webp|jpe?g)(?:\?|#|$)/);
  return m?.[1] ?? null;
}

async function downloadImage(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image ${res.status} for ${url}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const ct = res.headers.get("content-type") || undefined;
  const ext = inferExtFromUrl(url) ?? inferExtFromContentType(ct);
  return { buf, contentType: ct ?? "application/octet-stream", ext };
}

async function uploadToBucket(
  bucket: string,
  pathNoExt: string,
  payload: { buf: Uint8Array; contentType: string; ext: string }
) {
  const path = `${pathNoExt}.${payload.ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, payload.buf, {
    contentType: payload.contentType,
    upsert: true
  });
  if (error) throw error;
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  return pub.publicUrl;
}

async function getTotalFixturesForLeague(code: string): Promise<number | null> {
  const res = await fetch(`${FD_BASE}/competitions/${code}/matches`, {
    headers: { "X-Auth-Token": FD_KEY, Accept: "application/json" }
  });
  if (!res.ok) {
    console.warn(`⚠️ Failed to fetch matches for ${code}: ${res.status}`);
    return null;
  }
  const payload = await res.json();
  const matches = Array.isArray(payload?.matches) ? payload.matches : [];
  const matchdays = new Set<number>();
  for (const m of matches) {
    if (typeof m?.matchday === "number") matchdays.add(m.matchday);
  }
  return matchdays.size > 0 ? matchdays.size : null;
}

// For hybrid competitions (Champions League, World Cup):
// - During LEAGUE_STAGE/GROUP_STAGE: current_stage = that stage, current_fixture = current matchday
// - During knockout: current_stage = 'LAST_16' / 'QUARTER_FINALS' etc., current_fixture = null
// - Before tournament starts: current_stage = earliest scheduled stage
async function getCupProgress(
  code: string
): Promise<{ current_stage: string | null; current_fixture: number | null }> {
  const res = await fetch(`${FD_BASE}/competitions/${code}/matches`, {
    headers: { "X-Auth-Token": FD_KEY, Accept: "application/json" }
  });
  if (!res.ok) {
    console.warn(`⚠️ Failed to fetch matches for ${code}: ${res.status}`);
    return { current_stage: null, current_fixture: null };
  }

  const payload = await res.json();
  const matches = Array.isArray(payload?.matches) ? payload.matches : [];

  // Find stages that have at least one non-scheduled match (in-progress or finished)
  const activeStages = new Set<string>();
  for (const m of matches) {
    if (m?.stage && m?.status !== "SCHEDULED" && m?.status !== "TIMED") {
      activeStages.add(m.stage);
    }
  }

  // Tournament hasn't started yet — use the EARLIEST scheduled stage, not the latest
  if (activeStages.size === 0) {
    const scheduledStages = new Set<string>();
    for (const m of matches) {
      if (m?.stage) scheduledStages.add(m.stage);
    }
    for (const stage of STAGE_ORDER) {
      if (scheduledStages.has(stage)) {
        console.info(`${code}: tournament not started yet, earliest stage = ${stage}`);
        return { current_stage: stage, current_fixture: 1 };
      }
    }
    return { current_stage: null, current_fixture: null };
  }

  // Walk STAGE_ORDER and keep the furthest active stage
  let current_stage: string | null = null;
  for (const stage of STAGE_ORDER) {
    if (activeStages.has(stage)) current_stage = stage;
  }

  // If in group/league phase, find current matchday
  let current_fixture: number | null = null;
  const firstPhaseStages = new Set(["LEAGUE_STAGE", "GROUP_STAGE"]);
  if (current_stage && firstPhaseStages.has(current_stage)) {
    const phaseMatches = matches.filter((m: any) => m?.stage === current_stage);
    const playedMatchdays = new Set<number>();
    for (const m of phaseMatches) {
      if (typeof m?.matchday === "number" && m?.status !== "SCHEDULED" && m?.status !== "TIMED") {
        playedMatchdays.add(m.matchday);
      }
    }
    current_fixture = playedMatchdays.size > 0 ? Math.max(...playedMatchdays) : 1;
  }

  return { current_stage, current_fixture };
}

async function processCompetition(
  apiComp: any,
  localTarget: { name: string; code: string; type: string }
) {
  const { data: existingComp } = await supabase
    .from("competitions")
    .select("total_fixtures, current_fixture, current_stage")
    .eq("id", apiComp.id)
    .single();

  let flagUrlStored = null;
  let logoUrlStored = null;

  if (apiComp.area?.flag) {
    try {
      const file = await downloadImage(apiComp.area.flag);
      const areaName = (apiComp.area.name ?? "area").replace(/\s+/g, "_");
      flagUrlStored = await uploadToBucket("flags", areaName, file);
    } catch (e) {
      console.warn("⚠️ Failed to store flag for", apiComp.code, e);
    }
  }

  if (apiComp.emblem) {
    try {
      const file = await downloadImage(apiComp.emblem);
      logoUrlStored = await uploadToBucket("competitions_logo", apiComp.code, file);
    } catch (e) {
      console.warn("⚠️ Failed to store emblem for", apiComp.code, e);
    }
  }

  const season = apiComp.currentSeason ?? null;
  const isCup = localTarget.type === "CUP";

  let totalFixtures: number | null = null;
  let current_fixture: number | null = null;
  let current_stage: string | null = existingComp?.current_stage ?? null;

  if (isCup) {
    try {
      const progress = await getCupProgress(apiComp.code);
      current_stage = progress.current_stage;
      current_fixture = progress.current_fixture;
    } catch (e) {
      console.warn("⚠️ Failed to compute cup progress for", apiComp.code, e);
    }
  } else {
    current_fixture = season?.currentMatchday ?? existingComp?.current_fixture;
    try {
      totalFixtures = await getTotalFixturesForLeague(apiComp.code);
    } catch (e) {
      console.warn("⚠️ Failed to compute total_fixtures for", apiComp.code, e);
    }
  }

  const newComp = {
    id: apiComp.id,
    name: localTarget.name ?? apiComp.name,
    code: apiComp.code,
    type: apiComp.type,
    logo: logoUrlStored,
    area: apiComp.area?.name ?? null,
    flag: flagUrlStored,
    season_id: season?.id ?? null,
    season_start: season?.startDate ?? null,
    season_end: season?.endDate ?? null,
    current_fixture,
    current_stage: isCup ? current_stage : null,
    total_fixtures: isCup ? null : (totalFixtures ?? existingComp?.total_fixtures ?? 0),
    updated_at: nowIso()
  };

  const { error } = await supabase.from("competitions").upsert(newComp, { onConflict: "id" });
  if (error) throw error;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!FD_KEY) throw new Error("FOOTBALL_ORG_API_KEY is not set");

    const targetByCode = new Map(TARGET_COMPETITIONS.map((c) => [c.code, c]));
    let synced = 0;

    // Fetch league competitions via areas filter
    const leagueRes = await fetch(`${FD_BASE}/competitions?areas=${LEAGUE_AREA_IDS}`, {
      headers: { "X-Auth-Token": FD_KEY, Accept: "application/json" }
    });
    if (!leagueRes.ok) throw new Error(`API ${leagueRes.status}: ${await leagueRes.text()}`);
    const leagueList = await leagueRes.json();

    for (const apiComp of leagueList.competitions ?? []) {
      const localTarget = targetByCode.get(apiComp.code);
      if (!localTarget) continue;
      try {
        await processCompetition(apiComp, localTarget);
        synced++;
        console.log(`✅ Synced league: ${apiComp.code}`);
      } catch (e) {
        console.error(`❌ Failed to sync ${apiComp.code}:`, e);
      }
    }

    // Fetch cup competitions individually
    for (const code of CUP_CODES) {
      const localTarget = targetByCode.get(code);
      if (!localTarget) continue;
      try {
        const cupRes = await fetch(`${FD_BASE}/competitions/${code}`, {
          headers: { "X-Auth-Token": FD_KEY, Accept: "application/json" }
        });
        if (!cupRes.ok) {
          console.warn(`⚠️ Failed to fetch cup ${code}: ${cupRes.status}`);
          continue;
        }
        const apiComp = await cupRes.json();
        await processCompetition(apiComp, localTarget);
        synced++;
        console.log(`✅ Synced cup: ${code}`);
      } catch (e) {
        console.error(`❌ Failed to sync cup ${code}:`, e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: `Synced ${synced} competitions`, synced }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("❌ Competition sync failed:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
