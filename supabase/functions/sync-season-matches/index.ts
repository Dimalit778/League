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
  releaseSyncLock,
  requireSyncAuth,
  tryAcquireSyncLock,
} from "../_shared/sync.ts";
import {
  logRejectedMatches,
  mapFootballMatches,
  upsertMatchRows,
} from "../_shared/footballMatches.ts";
import { logException } from "../_shared/monitoring.ts";

const JOB = "sync-season-matches";
const COMPETITION_CODES = ["PL", "PD", "BL1", "SA", "FL1", "CL"];
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
          logException(JOB, e, { operation: "football_api.fetch", competition: code });
          fetchErrors.push(`${code}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }

      const { rows, rejected } = mapFootballMatches(allMatches, { updatedAt: "now" });
      logRejectedMatches(JOB, rejected);
      console.info(`Collected ${rows.length} matches across ${COMPETITION_CODES.length} competitions`);

      const { updated: count, errors } = await upsertMatchRows(supabase, JOB, rows);
      const allErrors = [...fetchErrors, ...errors];
      if (rejected.length > 0) allErrors.push(`${rejected.length} match payload(s) rejected`);

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
