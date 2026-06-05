import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

const FD_BASE = "https://api.football-data.org/v4";
const ALLOWED = new Set(["PL", "PD", "SA", "BL1", "FL1", "CL", "WC"]);
const CUP_CODES = new Set(["CL", "WC"]);

const STAGE_ORDER = [
  "PRELIMINARY_ROUND",
  "QUALIFICATION_ROUND_1", "QUALIFICATION_ROUND_2", "QUALIFICATION_ROUND_3",
  "PLAYOFF_ROUND_1", "PLAYOFF_ROUND_2", "PLAYOFFS",
  "GROUP_STAGE", "LEAGUE_STAGE",
  "LAST_64", "LAST_32", "LAST_16",
  "QUARTER_FINALS", "SEMI_FINALS",
  "THIRD_PLACE", "FINAL",
] as const;

const nowIso = () => new Date().toISOString();

const must = (k: string) => {
  const v = Deno.env.get(k);
  if (!v) throw new Error(`${k} is not set`);
  return v;
};

const isPayload = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === "object";

function chunk<T>(arr: T[], size = 500): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// For CUP competitions: derive current_stage and current_fixture from match data.
// TIMED is included (scheduled with confirmed date) — only SCHEDULED is excluded.
function deriveCupProgress(matches: any[]): {
  current_stage: string | null;
  current_fixture: number | null;
  total_fixtures: number;
} {
  const started = matches.filter((m) => m?.status !== "SCHEDULED");
  const pool = started.length > 0 ? started : matches;
  const activeStages = new Set(pool.map((m: any) => m?.stage).filter(Boolean));

  let current_stage: string | null = null;
  for (const s of STAGE_ORDER) {
    if (activeStages.has(s)) current_stage = s;
  }
  if (!current_stage && pool.length > 0) {
    current_stage = pool[pool.length - 1]?.stage ?? null;
  }

  let current_fixture: number | null = null;
  const isGroupStage = current_stage === "GROUP_STAGE" || current_stage === "LEAGUE_STAGE";
  if (isGroupStage) {
    const played = started
      .filter((m: any) => m?.stage === current_stage && typeof m?.matchday === "number")
      .map((m: any) => m.matchday as number);
    current_fixture = played.length > 0 ? Math.max(...played) : 1;
  }

  return { current_stage, current_fixture, total_fixtures: matches.length };
}

// For LEAGUE competitions: total_fixtures = distinct matchdays count.
function deriveLeagueProgress(matches: any[]): {
  current_fixture: number | null;
  total_fixtures: number | null;
} {
  const matchdays = new Set(
    matches.map((m: any) => m?.matchday).filter((d: any) => typeof d === "number"),
  );
  const total_fixtures = matchdays.size > 0 ? matchdays.size : null;
  const current_fixture = matchdays.size > 0 ? Math.max(...matchdays) : null;
  return { current_fixture, total_fixtures };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = must("SUPABASE_URL");
    const SERVICE_ROLE = must("SUPABASE_SERVICE_ROLE_KEY");
    const FD_KEY = must("FOOTBALL_ORG_API_KEY");
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Read competition from query string or JSON body
    const url = new URL(req.url);
    const qComp = url.searchParams.get("competition");
    let body: Record<string, unknown> = {};
    const ct = req.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      try {
        const parsed = await req.json();
        if (isPayload(parsed)) body = parsed;
      } catch { /* ignore parse errors */ }
    }

    const competition = String(body.competition ?? qComp ?? "").trim().toUpperCase();
    if (!competition) throw new Error('Missing "competition" (e.g. ?competition=PL)');
    if (!ALLOWED.has(competition)) {
      throw new Error(`Invalid "competition". Allowed: ${Array.from(ALLOWED).join(", ")}`);
    }

    const isCup = CUP_CODES.has(competition);

    // Fetch all matches for the competition
    const res = await fetch(`${FD_BASE}/competitions/${competition}/matches`, {
      headers: { "X-Auth-Token": FD_KEY, Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`FD ${res.status}: ${await res.text()}`);

    const data = await res.json();
    const matches = Array.isArray(data?.matches) ? data.matches : [];
    const compId: number | null = data?.competition?.id ?? null;

    // Update competitions table
    if (compId != null) {
      if (isCup) {
        const { current_stage, current_fixture, total_fixtures } = deriveCupProgress(matches);
        const { error } = await supabase
          .from("competitions")
          .update({ current_stage, current_fixture, total_fixtures, updated_at: nowIso() })
          .eq("id", compId);
        if (error) throw new Error(`Competition update failed: ${error.message}`);
      } else {
        const { current_fixture, total_fixtures } = deriveLeagueProgress(matches);
        const { error } = await supabase
          .from("competitions")
          .update({ current_fixture, total_fixtures, updated_at: nowIso() })
          .eq("id", compId);
        if (error) throw new Error(`Competition update failed: ${error.message}`);
      }
    }

    // Upsert matches
    const rows = matches
      .filter((m: any) => m?.id)
      .map((m: any) => ({
        id: m.id,
        competition_id: m.competition?.id ?? compId,
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

    let upserted = 0;
    for (const part of chunk(rows)) {
      const { error } = await supabase.from("matches").upsert(part, { onConflict: "id" });
      if (error) throw new Error(`Upsert failed: ${error.message}`);
      upserted += part.length;
    }

    return new Response(
      JSON.stringify({ success: true, competition, fetched: rows.length, upserted }),
      { headers: corsHeaders },
    );
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    const reqId = crypto.randomUUID();
    console.error(JSON.stringify({ tag: "sync-matches", reqId, message: e.message, stack: e.stack }));
    return new Response(
      JSON.stringify({ success: false, reqId, message: e.message }),
      { status: 500, headers: { ...corsHeaders, "x-error-id": reqId } },
    );
  }
});
