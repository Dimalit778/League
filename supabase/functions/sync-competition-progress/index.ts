// sync-competition-progress
//
// Lightweight DAILY job. Owns ONLY the current progress fields of the target
// competitions:
//
//   current_matchday, current_stage, updated_at
//
// It never uploads images, never recalculates stable season metadata, never
// recalculates total_matchdays, and never touches match rows.
//
// Football-Data usage is kept minimal:
//   • 1 /competitions request covers all 5 domestic leagues (uses
//     currentSeason.currentMatchday directly — no per-match download).
//   • 1 /competitions/CL/matches request is needed only for the Champions
//     League, whose stage/matchday cannot be derived from currentMatchday
//     alone once it enters the knockout rounds.
//
// Cron/admin-only. All Football-Data calls go through the shared, sequential,
// rate-limited fdFetch; a sync lock prevents overlapping runs.
//
// deno-lint-ignore-file no-explicit-any
import {
  createServiceClient,
  errorResponse,
  lockedResponse,
  must,
  releaseSyncLock,
  requireSyncAuth,
  tryAcquireSyncLock,
} from "../_shared/sync.ts";
import { type FootballDataCompetition, getErrorMessage } from "../_shared/competition-assets.ts";
import {
  CHAMPIONS_LEAGUE_CODE,
  fetchCompetitionMatches,
  fetchTargetCompetitions,
  findLatestFinishedMatch,
  findNextUnfinishedMatch,
  type FootballDataMatch,
  getTargetByCode,
  getUniqueTargetAreaIds,
  isChampionsLeagueLeaguePhase,
} from "../_shared/competitions.ts";
import { upsertCurrentSeason } from "../_shared/seasons.ts";
import { logException } from "../_shared/monitoring.ts";

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const JOB = "sync-competition-progress";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-sync-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

const FD_KEY = Deno.env.get("FOOTBALL_ORG_API_KEY") ?? "";

const supabase = createServiceClient();

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type ProgressUpdate = {
  currentMatchday: number | null;
  currentStage: string | null;
};

type SyncFailure = { code: string; error: string };

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function createJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function validateEnvironment(): void {
  if (!FD_KEY) throw new Error("FOOTBALL_ORG_API_KEY is not set");
  must("SUPABASE_URL");
  must("SUPABASE_SERVICE_ROLE_KEY");
}

/**
 * Regular domestic league progress — derived without downloading matches.
 * current_matchday comes straight from currentSeason.currentMatchday.
 * current_stage prefers a valid API stage, otherwise REGULAR_SEASON.
 */
function deriveRegularProgress(apiCompetition: FootballDataCompetition): ProgressUpdate {
  const season = apiCompetition.currentSeason;
  const stages = season?.stages ?? [];
  const currentStage = stages.includes("REGULAR_SEASON")
    ? "REGULAR_SEASON"
    : stages[0] ?? "REGULAR_SEASON";

  return {
    currentMatchday: season?.currentMatchday ?? null,
    currentStage,
  };
}

/**
 * Champions League progress.
 *
 * The active match is the next unfinished match (earliest by utcDate, ignoring
 * cancelled matches); if the season is fully played we fall back to the latest
 * finished match. Its stage is the current stage.
 *
 * During the league phase current_matchday is that match's matchday. Once the
 * competition enters knockout (PLAYOFFS / LAST_16 / QUARTER_FINALS / …) the
 * matchday is meaningless and MUST be null — we never leave the last
 * league-phase matchday (e.g. 8) behind.
 */
function deriveChampionsLeagueProgress(matches: FootballDataMatch[]): ProgressUpdate {
  if (matches.length === 0) return { currentMatchday: null, currentStage: null };

  const activeMatch = findNextUnfinishedMatch(matches) ?? findLatestFinishedMatch(matches);
  const currentStage = activeMatch?.stage ?? null;

  const inLeaguePhase = isChampionsLeagueLeaguePhase(currentStage);
  const currentMatchday = inLeaguePhase && typeof activeMatch?.matchday === "number"
    ? activeMatch.matchday
    : null;

  return { currentMatchday, currentStage };
}

async function updateProgress(
  competitionId: number,
  seasonId: number,
  progress: ProgressUpdate,
): Promise<void> {
  await upsertCurrentSeason(supabase, {
    id: seasonId,
    competition_id: competitionId,
    current_matchday: progress.currentMatchday,
    current_stage: progress.currentStage,
  });
}

/* -------------------------------------------------------------------------- */
/* Edge Function                                                              */
/* -------------------------------------------------------------------------- */

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") {
    return createJsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  const denied = requireSyncAuth(request);
  if (denied) return denied;

  try {
    validateEnvironment();

    if (!(await tryAcquireSyncLock(supabase, JOB, 300))) return lockedResponse(JOB);

    try {
      // One request for every target competition (leagues + CL metadata).
      const apiCompetitions = await fetchTargetCompetitions(supabase, JOB, FD_KEY);
      const targetByCode = getTargetByCode();

      const syncedCodes: string[] = [];
      const failures: SyncFailure[] = [];

      // Sequential — fdFetch must run one call at a time (CL fetches matches).
      for (const apiCompetition of apiCompetitions) {
        const code = apiCompetition.code;
        if (!code) continue;

        const target = targetByCode.get(code);
        if (!target) continue;

        try {
          let progress: ProgressUpdate;
          if (target.kind === "CHAMPIONS_LEAGUE") {
            const matches = await fetchCompetitionMatches(
              supabase,
              JOB,
              FD_KEY,
              CHAMPIONS_LEAGUE_CODE,
            );
            progress = deriveChampionsLeagueProgress(matches);
          } else {
            progress = deriveRegularProgress(apiCompetition);
          }

          const seasonId = apiCompetition.currentSeason?.id;
          if (!seasonId) throw new Error(`Current season is missing for ${code}`);

          await updateProgress(apiCompetition.id, seasonId, progress);
          syncedCodes.push(code);
        } catch (error) {
          const message = getErrorMessage(error);
          logException(JOB, error, { operation: "competition.progress_update", competition: code });
          failures.push({ code, error: message });
        }
      }

      const returnedCodes = new Set(
        apiCompetitions
          .map((competition) => competition.code)
          .filter((code): code is string => typeof code === "string"),
      );
      const missingCodes = [...targetByCode.keys()].filter((code) => !returnedCodes.has(code));

      const success = failures.length === 0 && missingCodes.length === 0;

      await releaseSyncLock(supabase, JOB, success ? "success" : "error");

      return createJsonResponse(
        {
          success,
          message: `Updated progress for ${syncedCodes.length} competitions`,
          synced: syncedCodes.length,
          syncedCodes,
          missingCodes,
          failures,
          requestedAreas: getUniqueTargetAreaIds(),
        },
        success ? 200 : 207,
      );
    } catch (error) {
      await releaseSyncLock(supabase, JOB, "error");
      throw error;
    }
  } catch (error) {
    return errorResponse(JOB, error);
  }
});
