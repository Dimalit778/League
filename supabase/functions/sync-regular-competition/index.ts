// sync-regular-competitions
//
// Syncs metadata for the regular domestic leagues.
//
// Uses currentSeason.currentMatchday directly from Football-Data
// instead of downloading the complete match schedule.
//
// Protected by the shared sync auth + DB-backed rate limiter + sync lock.

import {
  errorResponse,
  FD_BASE,
  fdFetch,
  lockedResponse,
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

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const JOB = "sync-regular-competitions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-sync-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";

const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  "";

const FD_KEY = Deno.env.get("FOOTBALL_ORG_API_KEY") ?? "";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
);

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type TargetCompetition = {
  name: string;
  code: string;
  areaId: number;
  isFree: boolean;

  /**
   * Number of matchdays in the normal league season.
   *
   * This is kept in configuration because Football-Data's
   * Competition resource exposes currentMatchday but not
   * the total number of matchdays.
   *
   * If the league format changes, update this value.
   */
  totalMatchdays: number;
};

type FootballDataCompetitionsResponse = {
  count?: number;
  competitions?: FootballDataCompetition[];
};

type ExistingCompetition = {
  id: number;
  logo: string | null;
  flag: string | null;
  total_fixtures: number | null;
  current_fixture: number | null;
  current_stage: string | null;
};

type SyncFailure = {
  code: string;
  error: string;
};

/* -------------------------------------------------------------------------- */
/* Target leagues                                                             */
/* -------------------------------------------------------------------------- */

const TARGET_COMPETITIONS: TargetCompetition[] = [
  {
    name: "La Liga",
    code: "PD",
    areaId: 2224,
    isFree: true,
    totalMatchdays: 38,
  },
  {
    name: "Bundesliga",
    code: "BL1",
    areaId: 2088,
    isFree: true,
    totalMatchdays: 34,
  },
  {
    name: "Premier League",
    code: "PL",
    areaId: 2072,
    isFree: false,
    totalMatchdays: 38,
  },
  {
    name: "Serie A",
    code: "SA",
    areaId: 2114,
    isFree: false,
    totalMatchdays: 38,
  },
  {
    name: "Ligue 1",
    code: "FL1",
    areaId: 2081,
    isFree: false,
    totalMatchdays: 34,
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function createJsonResponse(
  body: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: jsonHeaders,
    },
  );
}

function validateEnvironment(): void {
  if (!SUPABASE_URL) {
    throw new Error("SUPABASE_URL is not set");
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set",
    );
  }

  if (!FD_KEY) {
    throw new Error(
      "FOOTBALL_ORG_API_KEY is not set",
    );
  }
}

function getUniqueAreaIds(): number[] {
  return [
    ...new Set(
      TARGET_COMPETITIONS.map(
        (competition) => competition.areaId,
      ),
    ),
  ];
}

function getCurrentStage(
  competition: FootballDataCompetition,
): string {
  const stages = competition.currentSeason?.stages ?? [];

  if (stages.includes("REGULAR_SEASON")) {
    return "REGULAR_SEASON";
  }

  return stages[0] ?? "REGULAR_SEASON";
}

/* -------------------------------------------------------------------------- */
/* Football-Data                                                              */
/* -------------------------------------------------------------------------- */

async function fetchTargetCompetitions(): Promise<FootballDataCompetition[]> {
  const url = new URL(
    `${FD_BASE}/competitions`,
  );

  url.searchParams.set(
    "areas",
    getUniqueAreaIds().join(","),
  );

  console.log(
    `Fetching regular competitions: ${url.toString()}`,
  );

  const payload = await fdFetch(
    supabase,
    JOB,
    url.toString(),
    FD_KEY,
  ) as FootballDataCompetitionsResponse;

  const competitions = Array.isArray(payload.competitions)
    ? payload.competitions
    : [];

  const targetCodes = new Set(
    TARGET_COMPETITIONS.map(
      (competition) => competition.code,
    ),
  );

  return competitions.filter(
    (
      competition,
    ): competition is FootballDataCompetition & {
      code: string;
    } =>
      typeof competition.code === "string" &&
      targetCodes.has(competition.code),
  );
}

/* -------------------------------------------------------------------------- */
/* Database                                                                   */
/* -------------------------------------------------------------------------- */

async function getExistingCompetition(
  competitionId: number,
): Promise<ExistingCompetition | null> {
  const { data, error } = await supabase
    .from("competitions")
    .select(`
      id,
      logo,
      flag,
      total_fixtures,
      current_fixture,
      current_stage
    `)
    .eq("id", competitionId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed reading competition ${competitionId}: ${error.message}`,
    );
  }

  return data as ExistingCompetition | null;
}

async function upsertCompetition(
  apiCompetition: FootballDataCompetition,
  targetCompetition: TargetCompetition,
  existingCompetition: ExistingCompetition | null,
  uploadedLogo: string | null,
  uploadedFlag: string | null,
): Promise<void> {
  const season = apiCompetition.currentSeason;

  if (!season) {
    console.warn(
      `Competition ${targetCompetition.code} has no currentSeason`,
    );
  }

  const record = {
    id: apiCompetition.id,

    name: targetCompetition.name ||
      apiCompetition.name,

    code: targetCompetition.code,

    type: apiCompetition.type,

    logo: uploadedLogo ??
      existingCompetition?.logo ??
      null,

    area: apiCompetition.area?.name ??
      null,

    flag: uploadedFlag ??
      existingCompetition?.flag ??
      null,

    season_id: season?.id ??
      null,

    season_start: season?.startDate ??
      null,

    season_end: season?.endDate ??
      null,

    /*
     * Existing DB column is still called current_fixture.
     *
     * Semantically this is a MATCHDAY.
     */
    current_fixture: season?.currentMatchday ??
      existingCompetition?.current_fixture ??
      null,

    /*
     * Existing DB column is still called total_fixtures.
     *
     * Semantically this is the number of MATCHDAYS.
     */
    total_fixtures: targetCompetition.totalMatchdays,

    current_stage: getCurrentStage(apiCompetition),

    is_free: targetCompetition.isFree,

    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("competitions")
    .upsert(
      record,
      {
        onConflict: "id",
      },
    );

  if (error) {
    throw new Error(
      `Failed upserting ${targetCompetition.code}: ${error.message}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Single competition                                                         */
/* -------------------------------------------------------------------------- */

async function syncCompetition(
  apiCompetition: FootballDataCompetition,
  targetCompetition: TargetCompetition,
): Promise<void> {
  console.log(
    `Starting sync for ${targetCompetition.code}`,
  );

  const existingCompetition = await getExistingCompetition(
    apiCompetition.id,
  );

  /*
   * These are ordinary CDN fetches,
   * not Football-Data API calls.
   */
  const [
    uploadedLogo,
    uploadedFlag,
  ] = await Promise.all([
    storeCompetitionLogo(
      supabase,
      apiCompetition,
    ),
    storeCompetitionFlag(
      supabase,
      apiCompetition,
    ),
  ]);

  await upsertCompetition(
    apiCompetition,
    targetCompetition,
    existingCompetition,
    uploadedLogo,
    uploadedFlag,
  );

  console.log(
    `Synced ${targetCompetition.code}`,
    {
      seasonId: apiCompetition.currentSeason?.id,
      currentMatchday: apiCompetition.currentSeason
        ?.currentMatchday,
      totalMatchdays: targetCompetition.totalMatchdays,
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Edge Function                                                              */
/* -------------------------------------------------------------------------- */

Deno.serve(
  async (
    request: Request,
  ): Promise<Response> => {
    if (request.method === "OPTIONS") {
      return new Response(
        "ok",
        {
          headers: corsHeaders,
        },
      );
    }

    if (request.method !== "POST") {
      return createJsonResponse(
        {
          success: false,
          error: "Method not allowed",
        },
        405,
      );
    }

    const denied = requireSyncAuth(request);

    if (denied) {
      return denied;
    }

    try {
      validateEnvironment();

      const acquired = await tryAcquireSyncLock(
        supabase,
        JOB,
        300,
      );

      if (!acquired) {
        return lockedResponse(JOB);
      }

      try {
        const apiCompetitions = await fetchTargetCompetitions();

        const targetByCode = new Map(
          TARGET_COMPETITIONS.map(
            (competition) =>
              [
                competition.code,
                competition,
              ] as const,
          ),
        );

        const syncedCodes: string[] = [];
        const failures: SyncFailure[] = [];

        for (
          const apiCompetition of apiCompetitions
        ) {
          const code = apiCompetition.code;

          if (!code) {
            continue;
          }

          const targetCompetition = targetByCode.get(code);

          if (!targetCompetition) {
            continue;
          }

          try {
            await syncCompetition(
              apiCompetition,
              targetCompetition,
            );

            syncedCodes.push(code);
          } catch (error) {
            const message = getErrorMessage(error);

            console.error(
              `Failed syncing ${code}:`,
              message,
            );

            failures.push({
              code,
              error: message,
            });
          }
        }

        const returnedCodes = new Set(
          apiCompetitions
            .map(
              (competition) => competition.code,
            )
            .filter(
              (
                code,
              ): code is string => typeof code === "string",
            ),
        );

        const missingCodes = TARGET_COMPETITIONS
          .map(
            (competition) => competition.code,
          )
          .filter(
            (code) => !returnedCodes.has(code),
          );

        const success = failures.length === 0 &&
          missingCodes.length === 0;

        await releaseSyncLock(
          supabase,
          JOB,
          success ? "success" : "error",
        );

        return createJsonResponse(
          {
            success,

            message: `Synced ${syncedCodes.length} regular competitions`,

            synced: syncedCodes.length,

            syncedCodes,

            missingCodes,

            failures,

            requestedAreas: getUniqueAreaIds(),
          },
          success ? 200 : 207,
        );
      } catch (error) {
        await releaseSyncLock(
          supabase,
          JOB,
          "error",
        );

        throw error;
      }
    } catch (error) {
      return errorResponse(
        JOB,
        error,
      );
    }
  },
);
