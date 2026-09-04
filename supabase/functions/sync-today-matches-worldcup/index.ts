// sync-today-matches-worldcup
// Syncs today's World Cup matches.
// Cron-only (every few minutes during the tournament). 1 football API call per run.
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

const JOB = "sync-today-matches-worldcup";
const WC_CODE = "WC";

Deno.serve(async (req) => {
  const denied = requireSyncAuth(req);
  if (denied) return denied;

  try {
    const supabase = createServiceClient();
    const FD_KEY = must("FOOTBALL_ORG_API_KEY");

    if (!(await tryAcquireSyncLock(supabase, JOB, 120))) {
      return lockedResponse(JOB);
    }

    try {
      // /matches endpoint filtered to WC — returns only today's matches
      const payload = await fdFetch(
        supabase,
        JOB,
        `${FD_BASE}/matches?competitions=${WC_CODE}`,
        FD_KEY,
      );
      const matches = Array.isArray(payload?.matches) ? payload.matches : [];
      console.info(`Today's WC matches: ${matches.length}`);

      if (matches.length === 0) {
        await releaseSyncLock(supabase, JOB, "success");
        return jsonResponse({
          success: true,
          updated: 0,
          message: "No WC matches today",
        });
      }

      const mapped = mapFootballMatches(matches, { updatedAt: "now" });
      const recovered = await retryRejectedMatchesById(
        JOB,
        mapped.rejected,
        { updatedAt: "now" },
        (matchId) =>
          fdFetch(supabase, JOB, `${FD_BASE}/matches/${matchId}`, FD_KEY),
      );
      const rows = [...mapped.rows, ...recovered.rows];
      const rejected = recovered.rejected;
      logRejectedMatches(JOB, rejected);
      const { updated, errors } = await upsertMatchRows(supabase, JOB, rows);
      console.info(`Updated ${updated} WC matches`);
      const partial = rejected.length > 0 || errors.length > 0;
      await releaseSyncLock(supabase, JOB, partial ? "partial" : "success");
      return jsonResponse({
        success: !partial,
        updated,
        totalFetched: matches.length,
        rejected: rejected.length,
        errors: errors.length > 0 ? errors : undefined,
      }, partial ? 207 : 200);
    } catch (err) {
      await releaseSyncLock(supabase, JOB, "error");
      throw err;
    }
  } catch (err) {
    return errorResponse(JOB, err);
  }
});
