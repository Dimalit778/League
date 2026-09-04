// sync-world-cup-matches
// Admin-only manual full sync of World Cup matches. 1 football API call.
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
import { upsertCurrentSeason } from "../_shared/seasons.ts";
import {
  logRejectedMatches,
  mapFootballMatches,
  upsertMatchRows,
} from "../_shared/footballMatches.ts";

const JOB = "sync-world-cup-matches";
const WORLD_CUP_COMPETITION = "WC";

Deno.serve(async (req) => {
  const denied = requireSyncAuth(req);
  if (denied) return denied;

  try {
    const supabase = createServiceClient();
    const FD_KEY = must("FOOTBALL_ORG_API_KEY");

    if (!(await tryAcquireSyncLock(supabase, JOB, 120))) return lockedResponse(JOB);

    try {
      const data = await fdFetch(
        supabase,
        JOB,
        `${FD_BASE}/competitions/${WORLD_CUP_COMPETITION}/matches`,
        FD_KEY,
      );
      const matches = Array.isArray(data?.matches) ? data.matches : [];
      const compId = data?.competition?.id ?? null;
      const seasonId = matches.find((match: any) => match?.season?.id)?.season?.id ?? null;

      const totalMatchdays = matches.reduce((mx: number, m: any) => {
        const md = Number(m?.matchday ?? 0);
        return Number.isFinite(md) ? Math.max(mx, md) : mx;
      }, 0);

      if (compId != null && seasonId != null) {
        await upsertCurrentSeason(supabase, {
          id: seasonId,
          competition_id: compId,
          total_matchdays: totalMatchdays,
        });
      }

      const { rows, rejected } = mapFootballMatches(matches, {
        updatedAt: "now",
        fallbackCompetitionId: compId,
      });
      logRejectedMatches(JOB, rejected);
      const { updated: upserted, errors } = await upsertMatchRows(supabase, JOB, rows);
      const partial = rejected.length > 0 || errors.length > 0;

      await releaseSyncLock(supabase, JOB, partial ? "partial" : "success");
      return jsonResponse({
        success: !partial,
        competition: WORLD_CUP_COMPETITION,
        fetched: matches.length,
        upserted,
        rejected: rejected.length,
        errors: errors.length > 0 ? errors : undefined,
        totalMatchdays,
      }, partial ? 207 : 200);
    } catch (err) {
      await releaseSyncLock(supabase, JOB, "error");
      throw err;
    }
  } catch (err) {
    return errorResponse(JOB, err);
  }
});
