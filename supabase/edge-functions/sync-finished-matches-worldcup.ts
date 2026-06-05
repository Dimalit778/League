// sync-finished-matches-worldcup
// Daily sync of all World Cup matches.
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

const FD_BASE_URL = "https://api.football-data.org/v4";
const WC_CODE = "WC";

const STAGE_ORDER = [
  "PRELIMINARY_ROUND",
  "QUALIFICATION_ROUND_1", "QUALIFICATION_ROUND_2", "QUALIFICATION_ROUND_3",
  "PLAYOFF_ROUND_1", "PLAYOFF_ROUND_2", "PLAYOFFS",
  "GROUP_STAGE",
  "LAST_64", "LAST_32", "LAST_16",
  "QUARTER_FINALS", "SEMI_FINALS",
  "THIRD_PLACE", "FINAL",
] as const;

const getEnvVar = (key: string) => {
  const v = Deno.env.get(key);
  if (!v) throw new Error(`${key} environment variable is not set`);
  return v;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function retry<T>(fn: () => Promise<T>, retries = 2, baseDelayMs = 300): Promise<T> {
  let i = 0;
  while (true) {
    try { return await fn(); }
    catch (e) { if (i++ >= retries) throw e; await sleep(baseDelayMs * 2 ** (i - 1)); }
  }
}

async function fetchFootballData(url: string, apiKey: string) {
  return retry(async () => {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 15_000);
    try {
      const res = await fetch(url, {
        headers: { "X-Auth-Token": apiKey, Accept: "application/json" },
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`FD API error (${res.status}): ${await res.text()}`);
      return res.json();
    } finally { clearTimeout(to); }
  });
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

const transformMatch = (m: any) => ({
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
    winner: m?.score?.winner ?? null,
    duration: m?.score?.duration ?? null,
    fullTime: { home: m?.score?.fullTime?.home ?? null, away: m?.score?.fullTime?.away ?? null },
    halfTime: { home: m?.score?.halfTime?.home ?? null, away: m?.score?.halfTime?.away ?? null },
  },
  referee: m?.referees?.[0]?.name ?? null,
  updated_at: new Date().toISOString(),
});

async function bulkUpsertMatches(
  supabase: ReturnType<typeof createClient>,
  rows: any[],
  chunkSize = 500,
): Promise<{ updated: number; errors: string[] }> {
  let updated = 0;
  const errors: string[] = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    const slice = rows.slice(i, i + chunkSize);
    try {
      const resp: any = await supabase.from("matches").upsert(slice, { onConflict: "id" }).select("id");
      if (resp?.error) { errors.push(resp.error.message); console.error("Upsert error:", resp.error.message); }
      else updated += Array.isArray(resp?.data) ? resp.data.length : slice.length;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(msg);
      console.error("Upsert threw:", msg);
    }
  }
  return { updated, errors };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    const SUPABASE_URL = getEnvVar("SUPABASE_URL");
    const SERVICE_ROLE = getEnvVar("SUPABASE_SERVICE_ROLE_KEY");
    const FD_KEY = getEnvVar("FOOTBALL_ORG_API_KEY");
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    console.info("Syncing World Cup matches...");

    const payload = await fetchFootballData(`${FD_BASE_URL}/competitions/${WC_CODE}/matches`, FD_KEY);
    const matches = Array.isArray(payload?.matches) ? payload.matches : [];
    console.info(`WC: ${matches.length} matches`);

    // Update current_stage and current_fixture on competitions table
    const compId = payload?.competition?.id ?? null;
    if (compId) {
      const progress = deriveCupProgress(matches);
      const { error: compErr } = await supabase
        .from("competitions")
        .update({
          current_stage: progress.current_stage,
          current_fixture: progress.current_fixture,
          updated_at: new Date().toISOString(),
        })
        .eq("id", compId);
      if (compErr) console.warn("Failed to update competition progress:", compErr.message);
      else console.info(`Updated WC progress: stage=${progress.current_stage}, fixture=${progress.current_fixture}`);
    }

    const rows = matches.filter((m: any) => m?.id).map(transformMatch);
    const { updated, errors } = await bulkUpsertMatches(supabase, rows);

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        updated,
        totalFetched: rows.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: CORS_HEADERS },
    );
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    const reqId = crypto.randomUUID();
    console.error("sync-finished-matches-worldcup error:", { reqId, message: e.message });
    return new Response(
      JSON.stringify({ success: false, reqId, message: e.message }),
      { status: 500, headers: { ...CORS_HEADERS, "x-error-id": reqId } },
    );
  }
});
