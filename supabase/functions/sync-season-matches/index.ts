// sync-season-matches
// Syncs the full-season match list for every app competition
// (PL, PD, BL1, SA, FL1, CL).
// Cron/admin-only. Run AFTER sync-season-teams — matches.home/away_team_id are
// FK to teams.id, so the teams must already exist.
//
// One football-data call per competition (6 total), all routed through the
// shared budget-aware fdFetch so we never trip the 10-calls/minute limit.
// deno-lint-ignore-file no-explicit-any
import {
  createServiceClient,
  errorResponse,
  FD_BASE,
  fdFetch,
  jsonResponse,
  lockedResponse,
  must,
  nowIso,
  releaseSyncLock,
  requireSyncAuth,
  tryAcquireSyncLock,
} from "../_shared/sync.ts";

const JOB = "sync-season-matches";
const COMPETITION_CODES = ["PL", "PD", "BL1", "SA", "FL1", "CL"];
const CHUNK_SIZE = 500;

const transformMatch = (m: any) => ({
  id: m.id,
  competition_id: m.competition?.id ?? null,
  season_id: m.season?.id ?? null,
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
});

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function bulkUpsert(supabase: any, table: string, rows: any[]) {
  let count = 0;
  const errors: string[] = [];
  for (const part of chunk(rows, CHUNK_SIZE)) {
    const { data, error } = await supabase.from(table).upsert(part, { onConflict: "id" }).select("id");
    if (error) {
      errors.push(error.message);
      console.error(`Upsert error (${table}):`, error.message);
    } else count += data?.length ?? part.length;
  }
  return { count, errors };
}

Deno.serve(async (req) => {
  const denied = requireSyncAuth(req);
  if (denied) return denied;

  try {
    const supabase = createServiceClient();
    const FD_KEY = must("FOOTBALL_ORG_API_KEY");

    if (!(await tryAcquireSyncLock(supabase, JOB, 300))) return lockedResponse(JOB);

    try {
      // Sequential — the shared fdFetch must run one call at a time.
      const allMatches: any[] = [];
      const fetchErrors: string[] = [];

      for (const code of COMPETITION_CODES) {
        try {
          const payload = await fdFetch(supabase, JOB, `${FD_BASE}/competitions/${code}/matches`, FD_KEY);
          const matches = Array.isArray(payload?.matches) ? payload.matches : [];
          allMatches.push(...matches);
        } catch (e) {
          fetchErrors.push(`${code}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }

      const rows = allMatches.filter((m) => m?.id).map(transformMatch);
      console.info(`Collected ${rows.length} matches across ${COMPETITION_CODES.length} competitions`);

      const { count, errors } = await bulkUpsert(supabase, "matches", rows);
      const allErrors = [...fetchErrors, ...errors];

      await releaseSyncLock(supabase, JOB, allErrors.length > 0 ? "error" : "success");

      return jsonResponse({
        success: allErrors.length === 0,
        matches: count,
        totalFetched: rows.length,
        errors: allErrors.length > 0 ? allErrors : undefined,
      });
    } catch (e) {
      await releaseSyncLock(supabase, JOB, "error");
      throw e;
    }
  } catch (e) {
    return errorResponse(JOB, e);
  }
});
