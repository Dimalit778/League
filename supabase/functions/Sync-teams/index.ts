// /supabase/functions/sync_teams/index.ts
// Admin-only manual sync of World Cup teams. 1 football API call.
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  fdFetch,
  lockedResponse,
  releaseSyncLock,
  requireSyncAuth,
  tryAcquireSyncLock,
} from "../_shared/sync.ts";
const JOB = "sync-worldcup-teams";
/** ---------- Config ---------- */ const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
};
const FD_BASE = "https://api.football-data.org/v4";
const WORLD_CUP_COMPETITION = {
  name: "FIFA World Cup",
  code: "WC"
};
const BULK_CHUNK = 500;
/** ---------- Utils ---------- */ const must = (k)=>{
  const v = Deno.env.get(k);
  if (!v) {
    throw new Error(`${k} is not set`);
  }
  return v;
};
function mapTeam(t) {
  const now = new Date().toISOString();
  return {
    id: t.id,
    name: t.name ?? null,
    shortName: t.shortName ?? null,
    tla: t.tla ?? null,
    venue: t.venue ?? null,
    clubColors: t.clubColors ?? null,
    updated_at: now
  };
}
function dedupeTeamsById(teams) {
  const teamsById = new Map();
  for (const team of teams){
    if (team?.id && !teamsById.has(team.id)) {
      teamsById.set(team.id, team);
    }
  }
  return Array.from(teamsById.values());
}
async function fetchWorldCupTeams(supabase, fdKey) {
  const url = `${FD_BASE}/competitions/${WORLD_CUP_COMPETITION.code}/teams`;
  const res = await fdFetch(supabase, JOB, url, fdKey);
  const teams = Array.isArray(res?.teams) ? res.teams : [];
  console.info(`${WORLD_CUP_COMPETITION.code}: Found ${teams.length} teams`);
  return teams;
}
async function bulkUpsertTeams(supabase, teams) {
  let synced = 0;
  const dbErrors = [];
  for(let i = 0; i < teams.length; i += BULK_CHUNK){
    const slice = teams.slice(i, i + BULK_CHUNK);
    try {
      const resp = await supabase.from("teams").upsert(slice, {
        onConflict: "id"
      }).select("id");
      if (resp && "error" in resp && resp.error) {
        console.error("Teams bulk upsert error:", resp.error);
        dbErrors.push(resp.error?.message ?? String(resp.error));
      } else {
        const count = Array.isArray(resp?.data) ? resp.data.length : slice.length;
        synced += count;
      }
    } catch (e) {
      dbErrors.push(e instanceof Error ? e.message : String(e));
      console.error("Teams bulk upsert threw:", e);
    }
  }
  return {
    synced,
    dbErrors
  };
}
/** ---------- Main sync function ---------- */ async function syncWorldCupTeams(supabase, fdKey) {
  const rawTeams = await fetchWorldCupTeams(supabase, fdKey);
  const uniqueTeams = dedupeTeamsById(rawTeams);
  console.info(`Total unique World Cup teams collected: ${uniqueTeams.length}`);
  if (uniqueTeams.length === 0) {
    return {
      success: true,
      synced: 0,
      totalCollected: 0
    };
  }
  const mappedTeams = uniqueTeams.map(mapTeam);
  const { synced, dbErrors } = await bulkUpsertTeams(supabase, mappedTeams);
  return {
    success: dbErrors.length === 0,
    synced,
    totalCollected: uniqueTeams.length,
    errors: dbErrors.length ? {
      db: dbErrors
    } : undefined
  };
}
/** ---------- Main handler ---------- */ Deno.serve(async (req)=>{
  const denied = requireSyncAuth(req);
  if (denied) return denied;
  try {
    const SUPABASE_URL = must("SUPABASE_URL");
    const SERVICE_ROLE = must("SUPABASE_SERVICE_ROLE_KEY");
    const FD_KEY = must("FOOTBALL_ORG_API_KEY");
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    if (!(await tryAcquireSyncLock(supabase, JOB, 300))) return lockedResponse(JOB);
    let result;
    try {
      result = await syncWorldCupTeams(supabase, FD_KEY);
      await releaseSyncLock(supabase, JOB, result.success ? "success" : "partial");
    } catch (err) {
      await releaseSyncLock(supabase, JOB, "error");
      throw err;
    }
    console.info(`✅ Synced ${result.synced} World Cup teams`);
    return new Response(JSON.stringify(result), {
      headers: CORS_HEADERS
    });
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    const reqId = crypto.randomUUID();
    console.error("❌ World Cup teams sync failed:", {
      reqId,
      message: e.message,
      stack: e.stack
    });
    return new Response(JSON.stringify({
      success: false,
      reqId,
      message: e.message
    }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
});
