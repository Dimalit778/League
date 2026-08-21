// sync-competitions
//
// Owns the STABLE, season-level competition metadata for the 5 domestic
// leagues + UEFA Champions League:
//
//   id, code, name, type, area, logo, flag,
//   season_id, season_start, season_end, total_matchdays, is_free
//
// total_matchdays is CALCULATED from the season's actual match data (never
// hardcoded): the number of unique numeric matchdays. For the Champions League
// it counts ONLY explicit league-phase matchdays.
//
// Runs rarely — once around the start of a season, or manually. It seeds
// current_matchday / current_stage on first insert as a fallback but does NOT
// own daily progress (see sync-competition-progress) and never re-downloads
// images unless run again.
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
  nowIso,
  releaseSyncLock,
  requireSyncAuth,
  tryAcquireSyncLock,
} from "../_shared/sync.ts";
import {
  type FootballDataCompetition,
  getErrorMessage,
  storeCompetitionFlag,
  storeCompetitionLogo,
} from "../_shared/competition-assets.ts";
import {
  CHAMPIONS_LEAGUE_LEAGUE_PHASE_STAGES,
  fetchCompetitionMatches,
  fetchTargetCompetitions,
  type FootballDataMatch,
  getTargetByCode,
  getUniqueMatchdays,
  getUniqueTargetAreaIds,
  isChampionsLeagueLeaguePhase,
  type TargetCompetition,
  TARGET_COMPETITIONS,
} from "../_shared/competitions.ts";

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const JOB = "sync-competitions";

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

type ExistingCompetition = {
  id: number;
  logo: string | null;
  flag: string | null;
  total_matchdays: number | null;
  current_matchday: number | null;
  current_stage: string | null;
  season_id: number | null;
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
  // SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are validated by createServiceClient().
  must("SUPABASE_URL");
  must("SUPABASE_SERVICE_ROLE_KEY");
}

/**
 * total_matchdays = number of unique matchdays in the season.
 *
 * Regular leagues: every numeric matchday counts.
 * Champions League: ONLY explicit league-phase stages count, so qualification,
 * playoffs and the knockout rounds cannot inflate the value.
 */
function calculateTotalMatchdays(
  competition: TargetCompetition,
  matches: FootballDataMatch[],
): number | null {
  const relevant = competition.kind === "CHAMPIONS_LEAGUE"
    ? matches.filter((match) => isChampionsLeagueLeaguePhase(match.stage))
    : matches;

  const count = getUniqueMatchdays(relevant).length;
  return count > 0 ? count : null;
}

/**
 * Initial current_stage seeded only when the row is first inserted.
 * Prefers a valid stage from the API; falls back to REGULAR_SEASON for leagues.
 */
function seedCurrentStage(
  competition: TargetCompetition,
  apiCompetition: FootballDataCompetition,
): string | null {
  const stages = apiCompetition.currentSeason?.stages ?? [];
  if (competition.kind === "CHAMPIONS_LEAGUE") {
    const leaguePhase = stages.find((stage) => CHAMPIONS_LEAGUE_LEAGUE_PHASE_STAGES.has(stage));
    return leaguePhase ?? stages[0] ?? null;
  }
  if (stages.includes("REGULAR_SEASON")) return "REGULAR_SEASON";
  return stages[0] ?? "REGULAR_SEASON";
}

/* -------------------------------------------------------------------------- */
/* Database                                                                   */
/* -------------------------------------------------------------------------- */

async function getExistingCompetition(competitionId: number): Promise<ExistingCompetition | null> {
  const { data, error } = await supabase
    .from("competitions")
    .select("id, logo, flag, total_matchdays, current_matchday, current_stage, season_id")
    .eq("id", competitionId)
    .maybeSingle();

  if (error) throw new Error(`Failed reading competition ${competitionId}: ${error.message}`);
  return data as ExistingCompetition | null;
}

async function upsertCompetition(params: {
  apiCompetition: FootballDataCompetition;
  targetCompetition: TargetCompetition;
  existing: ExistingCompetition | null;
  totalMatchdays: number | null;
  uploadedLogo: string | null;
  uploadedFlag: string | null;
}): Promise<void> {
  const { apiCompetition, targetCompetition, existing, totalMatchdays, uploadedLogo, uploadedFlag } =
    params;

  const season = apiCompetition.currentSeason;
  const isFirstInsert = existing === null;

  const record = {
    id: apiCompetition.id,
    code: targetCompetition.code,
    name: targetCompetition.name || apiCompetition.name,
    type: apiCompetition.type,

    // Preserve stored asset if a fresh upload failed; never wipe on failure.
    logo: uploadedLogo ?? existing?.logo ?? null,
    area: apiCompetition.area?.name ?? null,
    flag: uploadedFlag ?? existing?.flag ?? null,

    // Stable season metadata. Fall back to existing values rather than
    // overwriting valid data with an accidental null from the API.
    season_id: season?.id ?? existing?.season_id ?? null,
    season_start: season?.startDate ?? undefined,
    season_end: season?.endDate ?? undefined,

    // Calculated; keep the previous value if this run could not compute one.
    total_matchdays: totalMatchdays ?? existing?.total_matchdays ?? 0,

    // Progress is owned by sync-competition-progress. Seed it only on the very
    // first insert as a fallback; on subsequent runs leave it untouched.
    current_matchday: isFirstInsert
      ? season?.currentMatchday ?? null
      : existing?.current_matchday ?? null,
    current_stage: isFirstInsert
      ? seedCurrentStage(targetCompetition, apiCompetition)
      : existing?.current_stage ?? null,

    is_free: targetCompetition.isFree,
    updated_at: nowIso(),
  };

  // Drop undefined season fields so we never write NULL over a good value.
  if (record.season_start === undefined) delete (record as any).season_start;
  if (record.season_end === undefined) delete (record as any).season_end;

  const { error } = await supabase.from("competitions").upsert(record, { onConflict: "id" });
  if (error) throw new Error(`Failed upserting ${targetCompetition.code}: ${error.message}`);
}

/* -------------------------------------------------------------------------- */
/* Single competition sync                                                    */
/* -------------------------------------------------------------------------- */

async function syncCompetition(
  apiCompetition: FootballDataCompetition,
  targetCompetition: TargetCompetition,
): Promise<void> {
  const existing = await getExistingCompetition(apiCompetition.id);

  // fdFetch is sequential-only: fetch the schedule to compute total_matchdays
  // FIRST, then download images in parallel (plain CDN fetches, not the API).
  const matches = await fetchCompetitionMatches(supabase, JOB, FD_KEY, targetCompetition.code);
  const totalMatchdays = calculateTotalMatchdays(targetCompetition, matches);

  const [uploadedLogo, uploadedFlag] = await Promise.all([
    storeCompetitionLogo(supabase, apiCompetition),
    storeCompetitionFlag(supabase, apiCompetition),
  ]);

  await upsertCompetition({
    apiCompetition,
    targetCompetition,
    existing,
    totalMatchdays,
    uploadedLogo,
    uploadedFlag,
  });

  console.log(`Synced ${targetCompetition.code}`, {
    seasonId: apiCompetition.currentSeason?.id,
    totalMatchdays,
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
      const apiCompetitions = await fetchTargetCompetitions(supabase, JOB, FD_KEY);
      const targetByCode = getTargetByCode();

      const syncedCodes: string[] = [];
      const failures: SyncFailure[] = [];

      // Sequential — fdFetch must run one call at a time.
      for (const apiCompetition of apiCompetitions) {
        const code = apiCompetition.code;
        if (!code) continue;

        const targetCompetition = targetByCode.get(code);
        if (!targetCompetition) continue;

        try {
          await syncCompetition(apiCompetition, targetCompetition);
          syncedCodes.push(code);
        } catch (error) {
          const message = getErrorMessage(error);
          console.error(`Failed syncing ${code}:`, message);
          failures.push({ code, error: message });
        }
      }

      const returnedCodes = new Set<string>();
      for (const competition of apiCompetitions) {
        if (typeof competition.code === "string") {
          returnedCodes.add(competition.code);
        }
      }

      const missingCodes: string[] = [];
      for (const competition of TARGET_COMPETITIONS) {
        if (!returnedCodes.has(competition.code)) {
          missingCodes.push(competition.code);
        }
      }

      const success = failures.length === 0 && missingCodes.length === 0;

      // Record the true outcome — a partial sync must not be marked success.
      await releaseSyncLock(supabase, JOB, success ? "success" : "error");

      return createJsonResponse(
        {
          success,
          message: `Synced ${syncedCodes.length} competitions`,
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
