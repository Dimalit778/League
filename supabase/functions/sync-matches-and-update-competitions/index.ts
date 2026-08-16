import { createClient } from "npm:@supabase/supabase-js@2";
import { requireSyncAuth } from "../_shared/sync.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-sync-secret",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

const FD_BASE_URL = "https://api.football-data.org/v4";

/**
 * league:
 * משתמש ב-matchday ומעדכן current_fixture + total_fixtures.
 *
 * stage:
 * משתמש ב-stage ומעדכן current_stage.
 */
const COMPETITIONS = [
  { code: "PL", type: "league" },
  { code: "PD", type: "league" },
  // { code: "SA", type: "league" },
  // { code: "BL1", type: "league" },
  // { code: "FL1", type: "league" },
  { code: "CL", type: "stage" },
  { code: "WC", type: "stage" },

] as const;

type CompetitionConfig = (typeof COMPETITIONS)[number];
type CompetitionType = CompetitionConfig["type"];

type FootballMatch = {
  id?: number;
  matchday?: number | null;
  utcDate?: string | null;
  status?: string | null;
  stage?: string | null;
  group?: string | null;

  competition?: {
    id?: number | null;
    code?: string | null;
  };

  homeTeam?: {
    id?: number | null;
  };

  awayTeam?: {
    id?: number | null;
  };

  score?: {
    winner?: string | null;
    duration?: string | null;

    fullTime?: {
      home?: number | null;
      away?: number | null;
    };

    halfTime?: {
      home?: number | null;
      away?: number | null;
    };
  };

  referees?: Array<{
    name?: string | null;
  }>;
};

type FootballDataPayload = {
  competition?: {
    id?: number | null;
    code?: string | null;
  };

  matches?: FootballMatch[];
};

type SyncCompetitionResult = {
  competition: string;
  type: CompetitionType;
  success: boolean;
  fetched: number;
  upserted: number;
  current_fixture: number | null;
  total_fixtures: number | null;
  current_stage: string | null;
  errors?: string[];
};

const STAGE_ORDER = [
  "PRELIMINARY_ROUND",
  "QUALIFICATION_ROUND_1",
  "QUALIFICATION_ROUND_2",
  "QUALIFICATION_ROUND_3",
  "PLAYOFF_ROUND_1",
  "PLAYOFF_ROUND_2",
  "PLAYOFFS",
  "LEAGUE_STAGE",
  "GROUP_STAGE",
  "LAST_64",
  "LAST_32",
  "LAST_16",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "THIRD_PLACE",
  "FINAL",
] as const;

const ACTIVE_OR_COMPLETED_STATUSES = new Set([
  "TIMED",
  "IN_PLAY",
  "PAUSED",
  "EXTRA_TIME",
  "PENALTY_SHOOTOUT",
  "FINISHED",
  "AWARDED",
]);

const getEnvVar = (key: string): string => {
  const value = Deno.env.get(key);

  if (!value) {
    throw new Error(`${key} environment variable is not set`);
  }

  return value;
};

const nowIso = (): string => new Date().toISOString();

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function chunk<T>(rows: T[], size = 500): T[][] {
  const output: T[][] = [];

  for (let i = 0; i < rows.length; i += size) {
    output.push(rows.slice(i, i + size));
  }

  return output;
}

async function retry<T>(
  fn: () => Promise<T>,
  retries = 2,
  baseDelayMs = 1_000,
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }

      const delay = baseDelayMs * 2 ** attempt;

      attempt += 1;

      console.warn(
        `Request failed. Retrying in ${delay}ms. Attempt ${attempt}/${retries}`,
      );

      await sleep(delay);
    }
  }
}

async function fetchFootballData(
  competitionCode: string,
  apiKey: string,
): Promise<FootballDataPayload> {
  const url =
    `${FD_BASE_URL}/competitions/${competitionCode}/matches`;

  return retry(async () => {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 15_000);

    try {
      const response = await fetch(url, {
        headers: {
          "X-Auth-Token": apiKey,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const responseText = await response.text();

        throw new Error(
          `${competitionCode}: Football-Data API error ` +
            `(${response.status}): ${responseText}`,
        );
      }

      return await response.json() as FootballDataPayload;
    } finally {
      clearTimeout(timeout);
    }
  });
}

function hasStarted(match: FootballMatch): boolean {
  const status = match.status ?? "";

  return ACTIVE_OR_COMPLETED_STATUSES.has(status);
}

function deriveLeagueProgress(matches: FootballMatch[]): {
  currentFixture: number | null;
  totalFixtures: number | null;
} {
  const matchdays = matches
    .map((match) => match.matchday)
    .filter((matchday): matchday is number =>
      typeof matchday === "number"
    );

  const uniqueMatchdays = [...new Set(matchdays)];

  const totalFixtures =
    uniqueMatchdays.length > 0
      ? Math.max(...uniqueMatchdays)
      : null;

  const startedMatchdays = matches
    .filter(hasStarted)
    .map((match) => match.matchday)
    .filter((matchday): matchday is number =>
      typeof matchday === "number"
    );

  if (startedMatchdays.length > 0) {
    return {
      currentFixture: Math.max(...startedMatchdays),
      totalFixtures,
    };
  }

  return {
    currentFixture:
      uniqueMatchdays.length > 0
        ? Math.min(...uniqueMatchdays)
        : null,

    totalFixtures,
  };
}

function getStageIndex(stage: string): number {
  return STAGE_ORDER.indexOf(stage as (typeof STAGE_ORDER)[number]);
}

function getLatestStage(stages: string[]): string | null {
  if (stages.length === 0) {
    return null;
  }

  return stages.reduce((latest, stage) => {
    const latestIndex = getStageIndex(latest);
    const currentIndex = getStageIndex(stage);

    if (currentIndex === -1) {
      return latest;
    }

    if (latestIndex === -1 || currentIndex > latestIndex) {
      return stage;
    }

    return latest;
  });
}

function deriveStageProgress(matches: FootballMatch[]): {
  currentStage: string | null;
} {
  const startedStages = matches
    .filter(hasStarted)
    .map((match) => match.stage)
    .filter((stage): stage is string =>
      typeof stage === "string" && stage.length > 0
    );

  const currentStartedStage = getLatestStage([
    ...new Set(startedStages),
  ]);

  if (currentStartedStage) {
    return {
      currentStage: currentStartedStage,
    };
  }

  const allStages = matches
    .map((match) => match.stage)
    .filter((stage): stage is string =>
      typeof stage === "string" && stage.length > 0
    );

  const firstAvailableStage = [...new Set(allStages)]
    .sort((stageA, stageB) => {
      const indexA = getStageIndex(stageA);
      const indexB = getStageIndex(stageB);

      if (indexA === -1 && indexB === -1) {
        return stageA.localeCompare(stageB);
      }

      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    })[0];

  return {
    currentStage: firstAvailableStage ?? null,
  };
}

function transformMatch(
  match: FootballMatch,
  fallbackCompetitionId: number,
) {
  return {
    id: match.id,

    competition_id:
      match.competition?.id ??
      fallbackCompetitionId,

    fixture: match.matchday ?? null,
    kick_off: match.utcDate ?? null,
    status: match.status ?? null,
    stage: match.stage ?? null,
    group: match.group ?? null,

    home_team_id: match.homeTeam?.id ?? null,
    away_team_id: match.awayTeam?.id ?? null,

    score: {
      winner: match.score?.winner ?? null,
      duration: match.score?.duration ?? null,

      fullTime: {
        home: match.score?.fullTime?.home ?? null,
        away: match.score?.fullTime?.away ?? null,
      },

      halfTime: {
        home: match.score?.halfTime?.home ?? null,
        away: match.score?.halfTime?.away ?? null,
      },
    },

    referee: match.referees?.[0]?.name ?? null,
    updated_at: nowIso(),
  };
}

async function bulkUpsertMatches(
  supabase: ReturnType<typeof createClient>,
  rows: ReturnType<typeof transformMatch>[],
  chunkSize = 500,
): Promise<{
  upserted: number;
  errors: Array<{
    start: number;
    message: string;
  }>;
}> {
  let upserted = 0;

  const errors: Array<{
    start: number;
    message: string;
  }> = [];

  const parts = chunk(rows, chunkSize);

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    const start = index * chunkSize;

    try {
      const { data, error } = await supabase
        .from("matches")
        .upsert(part, {
          onConflict: "id",
        })
        .select("id");

      if (error) {
        errors.push({
          start,
          message: error.message,
        });

        console.error(
          `Matches upsert failed at row ${start}:`,
          error.message,
        );

        continue;
      }

      upserted += Array.isArray(data)
        ? data.length
        : part.length;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      errors.push({
        start,
        message,
      });

      console.error(
        `Matches upsert threw at row ${start}:`,
        message,
      );
    }
  }

  return {
    upserted,
    errors,
  };
}

async function updateCompetitionProgress(
  supabase: ReturnType<typeof createClient>,
  competitionId: number,
  competitionType: CompetitionType,
  matches: FootballMatch[],
): Promise<{
  currentFixture: number | null;
  totalFixtures: number | null;
  currentStage: string | null;
}> {
  if (competitionType === "league") {
    const {
      currentFixture,
      totalFixtures,
    } = deriveLeagueProgress(matches);

    const { error } = await supabase
      .from("competitions")
      .update({
        current_fixture: currentFixture,
        total_fixtures: totalFixtures,
        current_stage: null,
        updated_at: nowIso(),
      })
      .eq("id", competitionId);

    if (error) {
      throw new Error(
        `Competition ${competitionId} update failed: ${error.message}`,
      );
    }

    return {
      currentFixture,
      totalFixtures,
      currentStage: null,
    };
  }

  const { currentStage } = deriveStageProgress(matches);

  const { error } = await supabase
    .from("competitions")
    .update({
      current_stage: currentStage,
      current_fixture: null,
      total_fixtures: null,
      updated_at: nowIso(),
    })
    .eq("id", competitionId);

  if (error) {
    throw new Error(
      `Competition ${competitionId} update failed: ${error.message}`,
    );
  }

  return {
    currentFixture: null,
    totalFixtures: null,
    currentStage,
  };
}

async function syncCompetition(
  supabase: ReturnType<typeof createClient>,
  config: CompetitionConfig,
  footballDataApiKey: string,
): Promise<SyncCompetitionResult> {
  const payload = await fetchFootballData(
    config.code,
    footballDataApiKey,
  );

  const competitionId = payload.competition?.id;

  if (typeof competitionId !== "number") {
    throw new Error(
      `${config.code}: Missing competition ID from Football-Data response`,
    );
  }

  const matches = Array.isArray(payload.matches)
    ? payload.matches
    : [];

  console.info(
    `${config.code}: fetched ${matches.length} matches`,
  );

  const rows = matches
    .filter(
      (
        match,
      ): match is FootballMatch & {
        id: number;
      } => typeof match.id === "number",
    )
    .map((match) =>
      transformMatch(match, competitionId)
    );

  const {
    upserted,
    errors: upsertErrors,
  } = await bulkUpsertMatches(
    supabase,
    rows,
  );

  const progress = await updateCompetitionProgress(
    supabase,
    competitionId,
    config.type,
    matches,
  );

  const errorMessages = upsertErrors.map(
    (error) => error.message,
  );

  return {
    competition: config.code,
    type: config.type,
    success: errorMessages.length === 0,
    fetched: rows.length,
    upserted,
    current_fixture: progress.currentFixture,
    total_fixtures: progress.totalFixtures,
    current_stage: progress.currentStage,
    errors:
      errorMessages.length > 0
        ? errorMessages
        : undefined,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: CORS_HEADERS,
    });
  }

  const denied = requireSyncAuth(req);
  if (denied) return denied;

  try {
    if (
      req.method !== "GET" &&
      req.method !== "POST"
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Method not allowed",
        }),
        {
          status: 405,
          headers: CORS_HEADERS,
        },
      );
    }

    const SUPABASE_URL = getEnvVar(
      "SUPABASE_URL",
    );

    const SERVICE_ROLE = getEnvVar(
      "SUPABASE_SERVICE_ROLE_KEY",
    );

    const FD_KEY = getEnvVar(
      "FOOTBALL_ORG_API_KEY",
    );

    const supabase = createClient(
      SUPABASE_URL,
      SERVICE_ROLE,
    );

    console.info(
      `Starting competition sync: ${
        COMPETITIONS
          .map((competition) => competition.code)
          .join(", ")
      }`,
    );

    const results: SyncCompetitionResult[] = [];

    /*
     * רץ באופן סדרתי כדי להפחית סיכון ל-429.
     * ההמתנה היא בין תחרויות, לא אחרי האחרונה.
     */
    for (
      let index = 0;
      index < COMPETITIONS.length;
      index += 1
    ) {
      const config = COMPETITIONS[index];

      try {
        const result = await syncCompetition(
          supabase,
          config,
          FD_KEY,
        );

        results.push(result);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        console.error(
          `${config.code} sync failed:`,
          message,
        );

        results.push({
          competition: config.code,
          type: config.type,
          success: false,
          fetched: 0,
          upserted: 0,
          current_fixture: null,
          total_fixtures: null,
          current_stage: null,
          errors: [message],
        });
      }

      const isLastCompetition =
        index === COMPETITIONS.length - 1;

      if (!isLastCompetition) {
        await sleep(6_500);
      }
    }

    const successfulCompetitions = results.filter(
      (result) => result.success,
    ).length;

    const failedCompetitions = results.length -
      successfulCompetitions;

    const totalFetched = results.reduce(
      (sum, result) =>
        sum + result.fetched,
      0,
    );

    const totalUpserted = results.reduce(
      (sum, result) =>
        sum + result.upserted,
      0,
    );

    return new Response(
      JSON.stringify({
        success: failedCompetitions === 0,
        competitions: results.length,
        successfulCompetitions,
        failedCompetitions,
        totalFetched,
        totalUpserted,
        results,
      }),
      {
        status:
          successfulCompetitions === 0
            ? 500
            : 200,

        headers: CORS_HEADERS,
      },
    );
  } catch (error) {
    const normalizedError =
      error instanceof Error
        ? error
        : new Error(String(error));

    const reqId = crypto.randomUUID();

    console.error(
      JSON.stringify({
        tag: "sync-all-competitions",
        reqId,
        message: normalizedError.message,
        stack: normalizedError.stack,
      }),
    );

    return new Response(
      JSON.stringify({
        success: false,
        reqId,
        message: normalizedError.message,
      }),
      {
        status: 500,
        headers: {
          ...CORS_HEADERS,
          "x-error-id": reqId,
        },
      },
    );
  }
});
