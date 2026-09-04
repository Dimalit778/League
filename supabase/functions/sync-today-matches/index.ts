// sync-today-matches
// Syncs today's matches for leagues + Champions League.
// Cron-only (every few minutes on match days). 1 football API call per run.
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
  retryRejectedMatchesById,
  upsertMatchRows,
} from "../_shared/footballMatches.ts";
import { describeError } from "../_shared/monitoring.ts";
import {
  clearSyncFailureAlert,
  sendSyncFailureAlert,
} from "../_shared/syncAlerts.ts";

const JOB = "sync-today-matches";
const LEAGUE_CODES = "PL,PD,SA,BL1,FL1,CL";

Deno.serve(async (req) => {
  const denied = requireSyncAuth(req);
  if (denied) return denied;

  let supabase: any;
  try {
    supabase = createServiceClient();
    const FD_KEY = must("FOOTBALL_ORG_API_KEY");

    if (!(await tryAcquireSyncLock(supabase, JOB, 120))) {
      return lockedResponse(JOB);
    }

    try {
      const payload = await fdFetch(
        supabase,
        JOB,
        `${FD_BASE}/matches?competitions=${LEAGUE_CODES}`,
        FD_KEY,
      );
      const matches = Array.isArray(payload?.matches) ? payload.matches : [];
      console.info(`Today's matches (leagues+CL): ${matches.length}`);

      if (matches.length === 0) {
        await releaseSyncLock(supabase, JOB, "success");
        await clearSyncFailureAlert(supabase, JOB);
        return jsonResponse({
          success: true,
          updated: 0,
          message: "No matches today",
        });
      }

      const mapped = mapFootballMatches(matches, { updatedAt: "provider" });
      const recovered = await retryRejectedMatchesById(
        JOB,
        mapped.rejected,
        { updatedAt: "provider" },
        (matchId) =>
          fdFetch(supabase, JOB, `${FD_BASE}/matches/${matchId}`, FD_KEY),
      );
      const rows = [...mapped.rows, ...recovered.rows];
      const rejected = recovered.rejected;
      logRejectedMatches(JOB, rejected);
      const { updated, errors } = await upsertMatchRows(supabase, JOB, rows);
      console.info(`Updated ${updated} matches`);
      const partial = rejected.length > 0 || errors.length > 0;
      await releaseSyncLock(supabase, JOB, partial ? "partial" : "success");
      if (partial) {
        await sendSyncFailureAlert(supabase, {
          job: JOB,
          status: "partial",
          message: "sync-today-matches completed with rejected or failed rows",
          httpStatus: 207,
          updated,
          totalFetched: matches.length,
          rejected: rejected.length,
          upsertErrors: errors.length,
        });
      } else {
        await clearSyncFailureAlert(supabase, JOB);
      }
      return jsonResponse({
        success: !partial,
        updated,
        totalFetched: matches.length,
        rejected: rejected.length,
        rejectedDetails: rejected.length > 0 ? rejected : undefined,
        errors: errors.length > 0 ? errors : undefined,
      }, partial ? 207 : 200);
    } catch (err) {
      await releaseSyncLock(supabase, JOB, "error");
      throw err;
    }
  } catch (err) {
    if (supabase) {
      const details = describeError(err);
      await sendSyncFailureAlert(supabase, {
        job: JOB,
        status: "error",
        message: details.errorMessage,
        httpStatus: 500,
        errorName: details.errorName,
        errorCode: details.errorCode,
      });
    }
    return errorResponse(JOB, err);
  }
});
