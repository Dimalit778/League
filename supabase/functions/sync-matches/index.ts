// Admin-only manual sync of one regular league (PL/PD). 1 football API call.
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  FD_BASE,
  fdFetch,
  lockedResponse,
  releaseSyncLock,
  requireSyncAuth,
  tryAcquireSyncLock,
} from "../_shared/sync.ts";
const corsHeaders = {
  "Content-Type": "application/json"
};
const JOB = "sync-matches";
// רק ליגות רגילות, בלי גביעים/בתים
const ALLOWED_LEAGUES = new Set([
  "PL",
  "PD"
]);
const nowIso = ()=>new Date().toISOString();
const must = (key)=>{
  const value = Deno.env.get(key);
  if (!value) throw new Error(`${key} is not set`);
  return value;
};
const isPayload = (x)=>!!x && typeof x === "object";
function chunk(arr, size = 500) {
  const out = [];
  for(let i = 0; i < arr.length; i += size){
    out.push(arr.slice(i, i + size));
  }
  return out;
}
// לליגה רגילה: כמה מחזורים יש ומה המחזור הנוכחי לפי המשחקים שהגיעו מה-API
function deriveLeagueProgress(matches) {
  const matchdays = new Set(matches.map((m)=>m?.matchday).filter((d)=>typeof d === "number"));
  const total_fixtures = matchdays.size > 0 ? matchdays.size : null;
  const startedMatchdays = matches.filter((m)=>m?.status !== "SCHEDULED").map((m)=>m?.matchday).filter((d)=>typeof d === "number");
  const current_fixture = startedMatchdays.length > 0 ? Math.max(...startedMatchdays) : matchdays.size > 0 ? Math.min(...matchdays) : null;
  return {
    current_fixture,
    total_fixtures
  };
}
Deno.serve(async (req)=>{
  const denied = requireSyncAuth(req);
  if (denied) return denied;
  try {
    const SUPABASE_URL = must("SUPABASE_URL");
    const SERVICE_ROLE = must("SUPABASE_SERVICE_ROLE_KEY");
    const FD_KEY = must("FOOTBALL_ORG_API_KEY");
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    if (!(await tryAcquireSyncLock(supabase, JOB, 120))) return lockedResponse(JOB);
    try {
    const url = new URL(req.url);
    const qComp = url.searchParams.get("competition");
    let body = {};
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        const parsed = await req.json();
        if (isPayload(parsed)) body = parsed;
      } catch  {
      // ignore
      }
    }
    const competition = String(body.competition ?? qComp ?? "").trim().toUpperCase();
    if (!competition) {
      throw new Error('Missing "competition" e.g. ?competition=PL');
    }
    if (!ALLOWED_LEAGUES.has(competition)) {
      throw new Error(`Invalid "competition". Only regular leagues are allowed: ${Array.from(ALLOWED_LEAGUES).join(", ")}`);
    }
    const data = await fdFetch(supabase, JOB, `${FD_BASE}/competitions/${competition}/matches`, FD_KEY);
    const matches = Array.isArray(data?.matches) ? data.matches : [];
    const compId = data?.competition?.id ?? null;
    if (compId == null) {
      throw new Error("Missing competition id from Football-data response");
    }
    const { current_fixture, total_fixtures } = deriveLeagueProgress(matches);
    const { error: competitionUpdateError } = await supabase.from("competitions").update({
      current_fixture,
      total_fixtures,
      current_stage: null,
      updated_at: nowIso()
    }).eq("id", compId);
    if (competitionUpdateError) {
      throw new Error(`Competition update failed: ${competitionUpdateError.message}`);
    }
    const rows = matches.filter((m)=>m?.id).map((m)=>({
        id: m.id,
        competition_id: m.competition?.id ?? compId,
        season_id: m.season?.id ?? null,
        fixture: m.matchday ?? null,
        kick_off: m.utcDate ?? null,
        status: m.status ?? null,
        // בליגות רגילות אין צורך ב-stage/group
        stage: null,
        group: null,
        home_team_id: m.homeTeam?.id ?? null,
        away_team_id: m.awayTeam?.id ?? null,
        score: {
          winner: m.score?.winner ?? null,
          duration: m.score?.duration ?? null,
          fullTime: {
            home: m.score?.fullTime?.home ?? null,
            away: m.score?.fullTime?.away ?? null
          },
          halfTime: {
            home: m.score?.halfTime?.home ?? null,
            away: m.score?.halfTime?.away ?? null
          }
        },
        referee: m.referees?.[0]?.name ?? null,
        updated_at: nowIso()
      }));
    let upserted = 0;
    for (const part of chunk(rows)){
      const { error } = await supabase.from("matches").upsert(part, {
        onConflict: "id"
      });
      if (error) {
        throw new Error(`Matches upsert failed: ${error.message}`);
      }
      upserted += part.length;
    }
    await releaseSyncLock(supabase, JOB, "success");
    return new Response(JSON.stringify({
      success: true,
      type: "regular_league",
      competition,
      fetched: rows.length,
      upserted,
      current_fixture,
      total_fixtures
    }), {
      headers: corsHeaders
    });
    } catch (err) {
      await releaseSyncLock(supabase, JOB, "error");
      throw err;
    }
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    const reqId = crypto.randomUUID();
    console.error(JSON.stringify({
      tag: "sync-regular-league-matches",
      reqId,
      message: e.message,
      stack: e.stack
    }));
    return new Response(JSON.stringify({
      success: false,
      reqId,
      message: e.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "x-error-id": reqId
      }
    });
  }
});
