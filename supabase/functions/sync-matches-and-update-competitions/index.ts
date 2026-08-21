// sync-matches-and-update-competitions
//
// Match-record sync for the configured competitions. Fetches each
// competition's matches from Football-Data and upserts them into `matches`.
//
// NOTE: competition PROGRESS (current_matchday / current_stage /
// total_matchdays) is intentionally NOT written here. That is owned solely by
// sync-competition-progress (daily) and sync-competitions (season metadata), so
// there is a single source of truth. This function only manages match rows.
//
// (The directory name is kept for deployment stability; its responsibility is
// now match records only.)
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

// Competitions whose match rows this job syncs.
const COMPETITIONS = [
  { code: "PL" },
  { code: "PD" },
  // { code: "SA" },
  // { code: "BL1" },
  // { code: "FL1" },
  { code: "CL" },
  { code: "WC" },
] as const;

type CompetitionConfig = (typeof COMPETITIONS)[number];

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
  success: boolean;
  fetched: number;
  upserted: number;
  errors?: string[];
};

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

  const errorMessages = upsertErrors.map(
    (error) => error.message,
  );

  return {
    competition: config.code,
    success: errorMessages.length === 0,
    fetched: rows.length,
    upserted,
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
      `Starting match sync: ${
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
          success: false,
          fetched: 0,
          upserted: 0,
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
        tag: "sync-matches-and-update-competitions",
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
