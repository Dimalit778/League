// v2_start-worldcup-sync
// Syncs competition, teams, and matches for FIFA World Cup.
// Run once every 4 years at the start of the tournament.
// Order: competition → teams → matches (required by FK constraints)

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
} as const;

const FD_BASE = "https://api.football-data.org/v4";
const WC_CODE = "WC";
const WC_NAME = "FIFA World Cup";

const STAGE_ORDER = [
  "PRELIMINARY_ROUND",
  "QUALIFICATION_ROUND_1", "QUALIFICATION_ROUND_2", "QUALIFICATION_ROUND_3",
  "PLAYOFF_ROUND_1", "PLAYOFF_ROUND_2", "PLAYOFFS",
  "GROUP_STAGE",
  "LAST_64", "LAST_32", "LAST_16",
  "QUARTER_FINALS", "SEMI_FINALS",
  "THIRD_PLACE", "FINAL",
] as const;

const CHUNK_SIZE = 500;
const FETCH_TIMEOUT_MS = 20_000;

// ─── Utils ────────────────────────────────────────────────────────────────────

const nowIso = () => new Date().toISOString();

const must = (key: string) => {
  const v = Deno.env.get(key);
  if (!v) throw new Error(`${key} is not set`);
  return v;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function retry<T>(fn: () => Promise<T>, retries = 2, baseDelay = 300): Promise<T> {
  let i = 0;
  while (true) {
    try { return await fn(); }
    catch (e) { if (i++ >= retries) throw e; await sleep(baseDelay * 2 ** (i - 1)); }
  }
}

async function fdFetch(url: string, fdKey: string): Promise<any> {
  return retry(async () => {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: { "X-Auth-Token": fdKey, Accept: "application/json" },
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`FD API ${res.status}: ${await res.text()}`);
      return res.json();
    } finally { clearTimeout(to); }
  });
}

function inferExt(url: string, ct?: string | null): string {
  const fromUrl = url.toLowerCase().match(/\.(svg|png|webp|jpe?g)(?:\?|#|$)/)?.[1];
  if (fromUrl) return fromUrl;
  if (ct?.includes("svg")) return "svg";
  if (ct?.includes("webp")) return "webp";
  if (ct?.includes("jpeg")) return "jpg";
  return "png";
}

async function downloadImage(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image download failed ${res.status}: ${url}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const ct = res.headers.get("content-type");
  return { buf, contentType: ct ?? "application/octet-stream", ext: inferExt(url, ct) };
}

async function tryUpload(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  path: string,
  imageUrl: string,
  label: string,
): Promise<string | null> {
  try {
    const file = await downloadImage(imageUrl);
    const fullPath = `${path}.${file.ext}`;
    const { error } = await supabase.storage.from(bucket).upload(fullPath, file.buf, {
      contentType: file.contentType,
      upsert: true,
      cacheControl: "31536000",
    });
    if (error) throw new Error(error.message);
    return supabase.storage.from(bucket).getPublicUrl(fullPath).data.publicUrl;
  } catch (e) {
    console.warn(`⚠️ Failed to upload ${label}:`, e);
    return null;
  }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function bulkUpsert(
  supabase: ReturnType<typeof createClient>,
  table: string,
  rows: any[],
): Promise<{ count: number; errors: string[] }> {
  let count = 0;
  const errors: string[] = [];
  for (const part of chunk(rows, CHUNK_SIZE)) {
    const { data, error } = await supabase.from(table).upsert(part, { onConflict: "id" }).select("id");
    if (error) { errors.push(error.message); console.error(`Upsert error (${table}):`, error.message); }
    else count += data?.length ?? part.length;
  }
  return { count, errors };
}

function deriveCupProgress(matches: any[]): { current_stage: string | null; current_fixture: number | null } {
  const started = matches.filter((m) => m?.status !== "SCHEDULED");
  const pool = started.length > 0 ? started : matches;
  const activeStages = new Set(pool.map((m) => m?.stage).filter(Boolean));

  let current_stage: string | null = null;
  for (const s of STAGE_ORDER) {
    if (activeStages.has(s)) current_stage = s;
  }
  if (!current_stage && pool.length > 0) current_stage = pool[pool.length - 1]?.stage ?? null;

  let current_fixture: number | null = null;
  if (current_stage === "GROUP_STAGE") {
    const played = started
      .filter((m) => m?.stage === "GROUP_STAGE" && typeof m?.matchday === "number")
      .map((m) => m.matchday as number);
    current_fixture = played.length > 0 ? Math.max(...played) : 1;
  }

  return { current_stage, current_fixture };
}

// ─── Step 1: Sync competition ────────────────────────────────────────────────

async function syncCompetition(
  supabase: ReturnType<typeof createClient>,
  fdKey: string,
  matches: any[],
): Promise<{ id: number }> {
  console.info("🏆 Step 1: Syncing World Cup competition...");

  const apiComp = await fdFetch(`${FD_BASE}/competitions/${WC_CODE}`, fdKey);
  const season = apiComp.currentSeason ?? null;
  const progress = deriveCupProgress(matches);

  const [logo, flag] = await Promise.all([
    apiComp.emblem
      ? tryUpload(supabase, "competitions_logo", WC_CODE, apiComp.emblem, "WC emblem")
      : Promise.resolve(null),
    apiComp.area?.flag
      ? tryUpload(supabase, "flags", apiComp.area.code ?? "World", apiComp.area.flag, "WC flag")
      : Promise.resolve(null),
  ]);

  const row = {
    id: apiComp.id,
    name: WC_NAME,
    code: WC_CODE,
    type: apiComp.type ?? "CUP",
    logo,
    flag,
    area: apiComp.area?.name ?? null,
    season_id: season?.id ?? null,
    season_start: season?.startDate ?? null,
    season_end: season?.endDate ?? null,
    current_fixture: progress.current_fixture,
    current_stage: progress.current_stage,
    total_fixtures: matches.length,
    updated_at: nowIso(),
  };

  const { error } = await supabase.from("competitions").upsert(row, { onConflict: "id" });
  if (error) throw new Error(`Competition upsert failed: ${error.message}`);

  console.info(`✅ World Cup competition synced (id: ${apiComp.id})`);
  return { id: apiComp.id };
}

// ─── Step 2: Sync teams ───────────────────────────────────────────────────────

async function syncTeams(
  supabase: ReturnType<typeof createClient>,
  fdKey: string,
): Promise<{ count: number; errors: string[] }> {
  console.info("⚽ Step 2: Syncing World Cup teams...");

  const payload = await fdFetch(`${FD_BASE}/competitions/${WC_CODE}/teams`, fdKey);
  const rawTeams = Array.isArray(payload?.teams) ? payload.teams : [];
  console.info(`Found ${rawTeams.length} teams`);

  const mappedTeams = await Promise.all(
    rawTeams.map(async (t: any) => {
      const logo = t.crest
        ? await tryUpload(supabase, "teams_logo", String(t.id), t.crest, `team ${t.id}`)
        : null;
      return {
        id: t.id,
        name: t.name ?? null,
        shortName: t.shortName ?? null,
        tla: t.tla ?? null,
        logo,
        venue: t.venue ?? null,
        updated_at: nowIso(),
      };
    }),
  );

  const { count, errors } = await bulkUpsert(supabase, "teams", mappedTeams);
  console.info(`✅ Teams synced: ${count}`);
  return { count, errors };
}

// ─── Step 3: Sync matches ─────────────────────────────────────────────────────

async function syncMatches(
  supabase: ReturnType<typeof createClient>,
  matches: any[],
): Promise<{ count: number; errors: string[] }> {
  console.info("🗓️ Step 3: Syncing World Cup matches...");

  const rows = matches
    .filter((m) => m?.id)
    .map((m) => ({
      id: m.id,
      competition_id: m.competition?.id ?? null,
      fixture: m.matchday ?? null,
      kick_off: m.utcDate ?? null,
      status: m.status ?? null,
      stage: m.stage ?? null,
      group: m.group ?? null,
      home_team_id: m.homeTeam?.id ?? null,
      away_team_id: m.awayTeam?.id ?? null,
      score: {
        winner: m.score?.winner ?? null,
        duration: m.score?.duration ?? null,
        fullTime: { home: m.score?.fullTime?.home ?? null, away: m.score?.fullTime?.away ?? null },
        halfTime: { home: m.score?.halfTime?.home ?? null, away: m.score?.halfTime?.away ?? null },
      },
      referee: m.referees?.[0]?.name ?? null,
      updated_at: nowIso(),
    }));

  const { count, errors } = await bulkUpsert(supabase, "matches", rows);
  console.info(`✅ Matches synced: ${count}`);
  return { count, errors };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    const SUPABASE_URL = must("SUPABASE_URL");
    const SERVICE_ROLE = must("SUPABASE_SERVICE_ROLE_KEY");
    const FD_KEY = must("FOOTBALL_ORG_API_KEY");
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    console.info("🚀 World Cup sync started");

    // Fetch matches once — reused by both syncCompetition and syncMatches
    const matchPayload = await fdFetch(`${FD_BASE}/competitions/${WC_CODE}/matches`, FD_KEY);
    const matches = Array.isArray(matchPayload?.matches) ? matchPayload.matches : [];
    console.info(`Fetched ${matches.length} World Cup matches`);

    // Step 1: competition (FK anchor for teams + matches)
    await syncCompetition(supabase, FD_KEY, matches);

    // Step 2: teams (FK anchor for matches)
    const { count: teamsCount, errors: teamErrors } = await syncTeams(supabase, FD_KEY);

    // Step 3: matches
    const { count: matchesCount, errors: matchErrors } = await syncMatches(supabase, matches);

    const allErrors = [...teamErrors, ...matchErrors];

    console.info(`✅ World Cup sync complete — teams: ${teamsCount}, matches: ${matchesCount}`);

    return new Response(
      JSON.stringify({
        success: allErrors.length === 0,
        teams: teamsCount,
        matches: matchesCount,
        errors: allErrors.length > 0 ? allErrors : undefined,
      }),
      { headers: CORS_HEADERS },
    );
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("❌ World Cup sync failed:", err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: CORS_HEADERS },
    );
  }
});
