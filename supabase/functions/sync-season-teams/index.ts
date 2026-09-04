// sync-season-teams
// Syncs teams for every app competition (PL, PD, BL1, SA, FL1, CL).
// Cron/admin-only. Run BEFORE sync-season-matches — matches.home/away_team_id
// are FK to teams.id, so the teams must exist first.
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
import { describeError, logException } from "../_shared/monitoring.ts";

const JOB = "sync-season-teams";
const COMPETITION_CODES = ["PL", "PD", "BL1", "SA", "FL1", "CL"];
const CHUNK_SIZE = 500;

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
      const details = describeError(error);
      errors.push(`${details.errorCode ?? "DB_ERROR"} ${details.errorMessage}`);
      logException(JOB, error, { operation: `${table}.bulk_upsert`, rowCount: part.length });
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
      const teamsById = new Map<number, any>();
      const fetchErrors: string[] = [];

      for (const code of COMPETITION_CODES) {
        try {
          const payload = await fdFetch(supabase, JOB, `${FD_BASE}/competitions/${code}/teams`, FD_KEY);
          const teams = Array.isArray(payload?.teams) ? payload.teams : [];
          for (const t of teams) {
            if (t?.id && !teamsById.has(t.id)) teamsById.set(t.id, t);
          }
        } catch (e) {
          logException(JOB, e, { operation: "football_api.fetch", competition: code });
          fetchErrors.push(`${code}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }

      const rawTeams = [...teamsById.values()];
      console.info(`Found ${rawTeams.length} unique teams`);

      const mapped = rawTeams.map((t) => ({
          id: t.id,
          name: t.name ?? null,
          shortName: t.shortName ?? null,
          tla: t.tla ?? null,
          venue: t.venue ?? null,
          clubColors: t.clubColors ?? null,
          updated_at: nowIso(),
        }));

      const { count, errors } = await bulkUpsert(supabase, "teams", mapped);
      const allErrors = [...fetchErrors, ...errors];

      await releaseSyncLock(supabase, JOB, allErrors.length > 0 ? "error" : "success");

      return jsonResponse({
        success: allErrors.length === 0,
        teams: count,
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
