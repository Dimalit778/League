// sync-all-competitions
// Syncs the 5 domestic leagues + UEFA Champions League metadata & schedule.
// Cron/admin-only. Goes through the shared budget-aware fdFetch (10 calls/min
// DB-backed limiter) and holds a sync lock so concurrent runs can't overlap.
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  errorResponse,
  fdFetch,
  FD_BASE,
  lockedResponse,
  releaseSyncLock,
  requireSyncAuth,
  tryAcquireSyncLock,
} from "../_shared/sync.ts";

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const JOB = "sync-all-competitions";

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
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const FD_KEY = Deno.env.get("FOOTBALL_ORG_API_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type TargetCompetition = {
  name: string;
  code: string;
  areaId: number;
  isFree: boolean;
  scheduleType: "REGULAR_LEAGUE" | "CHAMPIONS_LEAGUE";
};

type FootballDataArea = {
  id: number;
  name: string;
  code: string | null;
  flag: string | null;
};

type FootballDataSeason = {
  id: number;
  startDate: string;
  endDate: string;
  currentMatchday: number | null;
};

type FootballDataCompetition = {
  id: number;
  name: string;
  code: string | null;
  type: string | null;
  emblem: string | null;
  area: FootballDataArea | null;
  currentSeason: FootballDataSeason | null;
};

type FootballDataCompetitionsResponse = {
  count?: number;
  competitions?: FootballDataCompetition[];
};

type FootballDataMatch = {
  id: number;
  utcDate: string;
  status: string;
  stage: string | null;
  matchday: number | null;
};

type FootballDataMatchesResponse = {
  matches?: FootballDataMatch[];
};

type DownloadedImage = {
  buffer: Uint8Array;
  contentType: string;
  extension: string;
};

type CompetitionScheduleInfo = {
  totalFixtures: number | null;
  currentFixture: number | null;
  currentStage: string | null;
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
/* Target competitions                                                        */
/* -------------------------------------------------------------------------- */

const TARGET_COMPETITIONS: TargetCompetition[] = [
  { name: "La Liga", code: "PD", areaId: 2224, isFree: true, scheduleType: "REGULAR_LEAGUE" },
  { name: "Bundesliga", code: "BL1", areaId: 2088, isFree: true, scheduleType: "REGULAR_LEAGUE" },
  { name: "Premier League", code: "PL", areaId: 2072, isFree: false, scheduleType: "REGULAR_LEAGUE" },
  { name: "Serie A", code: "SA", areaId: 2114, isFree: false, scheduleType: "REGULAR_LEAGUE" },
  { name: "Ligue 1", code: "FL1", areaId: 2081, isFree: false, scheduleType: "REGULAR_LEAGUE" },
  { name: "UEFA Champions League", code: "CL", areaId: 2077, isFree: false, scheduleType: "CHAMPIONS_LEAGUE" },
];

/**
 * Football-Data עשוי להחזיר את שלב הליגה תחת שם שונה,
 * בהתאם למבנה התחרות והנתונים הזמינים.
 */
const CHAMPIONS_LEAGUE_LEAGUE_PHASE_STAGES = new Set([
  "LEAGUE_STAGE",
  "GROUP_STAGE",
  "REGULAR_SEASON",
]);

const COMPLETED_MATCH_STATUSES = new Set([
  "FINISHED",
  "AWARDED",
  "CANCELLED",
]);

/* -------------------------------------------------------------------------- */
/* Response helpers                                                           */
/* -------------------------------------------------------------------------- */

function createJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

/* -------------------------------------------------------------------------- */
/* General helpers                                                            */
/* -------------------------------------------------------------------------- */

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function getUniqueTargetAreaIds(): number[] {
  return [...new Set(TARGET_COMPETITIONS.map((competition) => competition.areaId))];
}

function isCompletedMatch(match: FootballDataMatch): boolean {
  return COMPLETED_MATCH_STATUSES.has(match.status);
}

function getMatchTimestamp(match: FootballDataMatch): number {
  const timestamp = new Date(match.utcDate).getTime();
  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

function sortMatchesByDate(matches: FootballDataMatch[]): FootballDataMatch[] {
  return [...matches].sort((first, second) => getMatchTimestamp(first) - getMatchTimestamp(second));
}

function findNextUnfinishedMatch(matches: FootballDataMatch[]): FootballDataMatch | null {
  const unfinishedMatches = matches.filter((match) => !isCompletedMatch(match));
  return sortMatchesByDate(unfinishedMatches)[0] ?? null;
}

function findLatestFinishedMatch(matches: FootballDataMatch[]): FootballDataMatch | null {
  const finishedMatches = matches.filter(isCompletedMatch);
  return sortMatchesByDate(finishedMatches).at(-1) ?? null;
}

function getUniqueMatchdays(matches: FootballDataMatch[]): number[] {
  const matchdays = matches
    .map((match) => match.matchday)
    .filter((matchday): matchday is number => typeof matchday === "number");
  return [...new Set(matchdays)].sort((first, second) => first - second);
}

/* -------------------------------------------------------------------------- */
/* Football-Data requests (all go through the shared rate-limited fdFetch)     */
/* -------------------------------------------------------------------------- */

async function fetchTargetCompetitions(): Promise<FootballDataCompetition[]> {
  const areaIds = getUniqueTargetAreaIds();
  const url = new URL(`${FD_BASE}/competitions`);
  url.searchParams.set("areas", areaIds.join(","));

  console.log(`Fetching competitions: ${url.toString()}`);

  const payload = (await fdFetch(supabase, JOB, url.toString(), FD_KEY)) as FootballDataCompetitionsResponse;
  const competitions = Array.isArray(payload.competitions) ? payload.competitions : [];

  const targetCodes = new Set(TARGET_COMPETITIONS.map((competition) => competition.code));

  return competitions.filter(
    (competition): competition is FootballDataCompetition & { code: string } =>
      typeof competition.code === "string" && targetCodes.has(competition.code),
  );
}

async function fetchCompetitionMatches(competitionCode: string): Promise<FootballDataMatch[]> {
  const url = `${FD_BASE}/competitions/${competitionCode}/matches`;
  const payload = (await fdFetch(supabase, JOB, url, FD_KEY)) as FootballDataMatchesResponse;
  return Array.isArray(payload.matches) ? payload.matches : [];
}

/* -------------------------------------------------------------------------- */
/* Regular league schedule                                                    */
/* -------------------------------------------------------------------------- */

/**
 * PL, PD, BL1, SA, FL1
 *
 * totalFixtures = מספר המחזורים הכולל.
 * currentFixture = המחזור הבא שעדיין לא הסתיים.
 * currentStage = בדרך כלל REGULAR_SEASON.
 */
async function syncRegularLeagueSchedule(competitionCode: string): Promise<CompetitionScheduleInfo> {
  const matches = await fetchCompetitionMatches(competitionCode);

  if (matches.length === 0) {
    return { totalFixtures: null, currentFixture: null, currentStage: "REGULAR_SEASON" };
  }

  const uniqueMatchdays = getUniqueMatchdays(matches);
  const nextMatch = findNextUnfinishedMatch(matches);
  const latestFinishedMatch = findLatestFinishedMatch(matches);

  const currentFixture = nextMatch?.matchday ?? latestFinishedMatch?.matchday ?? null;

  return {
    totalFixtures: uniqueMatchdays.length > 0 ? uniqueMatchdays.length : null,
    currentFixture,
    currentStage: nextMatch?.stage ?? latestFinishedMatch?.stage ?? "REGULAR_SEASON",
  };
}

/* -------------------------------------------------------------------------- */
/* Champions League schedule                                                  */
/* -------------------------------------------------------------------------- */

/**
 * CL:
 *
 * בשלב הליגה:
 * totalFixtures = מספר המחזורים בשלב הליגה.
 * currentFixture = המחזור הבא.
 * currentStage = LEAGUE_STAGE / GROUP_STAGE / REGULAR_SEASON.
 *
 * בנוקאאוט:
 * totalFixtures נשאר מספר מחזורי שלב הליגה.
 * currentFixture הופך ל-null.
 * currentStage הופך ל-PLAYOFFS / LAST_16 / QUARTER_FINALS וכו'.
 */
async function syncChampionsLeagueSchedule(): Promise<CompetitionScheduleInfo> {
  const matches = await fetchCompetitionMatches("CL");

  if (matches.length === 0) {
    return { totalFixtures: null, currentFixture: null, currentStage: null };
  }

  const leaguePhaseMatches = matches.filter(
    (match) => match.stage !== null && CHAMPIONS_LEAGUE_LEAGUE_PHASE_STAGES.has(match.stage),
  );

  /*
   * Fallback:
   * אם ה-API מחזיר stage לא מוכר, אוספים משחקים
   * שיש להם matchday לפני שלבי הנוקאאוט.
   */
  const matchesUsedForLeagueFixtures =
    leaguePhaseMatches.length > 0
      ? leaguePhaseMatches
      : matches.filter((match) => typeof match.matchday === "number" && !isKnockoutStage(match.stage));

  const leaguePhaseMatchdays = getUniqueMatchdays(matchesUsedForLeagueFixtures);

  const nextMatch = findNextUnfinishedMatch(matches);
  const latestFinishedMatch = findLatestFinishedMatch(matches);

  const activeMatch = nextMatch ?? latestFinishedMatch;
  const currentStage = activeMatch?.stage ?? null;

  const isLeaguePhase = currentStage !== null && isChampionsLeagueLeaguePhase(currentStage);

  return {
    totalFixtures: leaguePhaseMatchdays.length > 0 ? leaguePhaseMatchdays.length : null,

    /*
     * חשוב:
     * לא משאירים כאן את המחזור האחרון מהשלב הקודם.
     * ברגע שעוברים לנוקאאוט current_fixture יהיה null.
     */
    currentFixture:
      isLeaguePhase && typeof activeMatch?.matchday === "number" ? activeMatch.matchday : null,

    currentStage,
  };
}

function isChampionsLeagueLeaguePhase(stage: string): boolean {
  return CHAMPIONS_LEAGUE_LEAGUE_PHASE_STAGES.has(stage);
}

function isKnockoutStage(stage: string | null): boolean {
  if (!stage) return false;
  return [
    "PLAYOFFS",
    "PLAYOFF_ROUND_1",
    "PLAYOFF_ROUND_2",
    "LAST_64",
    "LAST_32",
    "LAST_16",
    "QUARTER_FINALS",
    "SEMI_FINALS",
    "THIRD_PLACE",
    "FINAL",
  ].includes(stage);
}

/* -------------------------------------------------------------------------- */
/* Schedule handler                                                           */
/* -------------------------------------------------------------------------- */

async function getCompetitionScheduleInfo(
  targetCompetition: TargetCompetition,
): Promise<CompetitionScheduleInfo> {
  switch (targetCompetition.scheduleType) {
    case "CHAMPIONS_LEAGUE":
      return await syncChampionsLeagueSchedule();
    case "REGULAR_LEAGUE":
      return await syncRegularLeagueSchedule(targetCompetition.code);
  }
}

/* -------------------------------------------------------------------------- */
/* Images                                                                     */
/* -------------------------------------------------------------------------- */

function inferExtensionFromContentType(contentType: string | null): string {
  if (!contentType) return "png";
  if (contentType.includes("svg")) return "svg";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  if (contentType.includes("png")) return "png";
  return "png";
}

function inferExtensionFromUrl(url: string): string | null {
  const match = url.toLowerCase().match(/\.(svg|png|webp|jpe?g)(?:\?|#|$)/);
  if (!match?.[1]) return null;
  return match[1] === "jpeg" ? "jpg" : match[1];
}

function sanitizeStoragePath(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_-]+/gu, "_")
    .replace(/^_+|_+$/g, "");
}

async function downloadImage(url: string): Promise<DownloadedImage> {
  // Plain fetch (not the rate-limited API host) — image CDN assets.
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Image download failed: ${response.status} ${response.statusText} ${url}`);
  }

  const buffer = new Uint8Array(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  const extension = inferExtensionFromUrl(url) ?? inferExtensionFromContentType(contentType);

  return { buffer, contentType, extension };
}

async function uploadImageToBucket(
  bucket: string,
  pathWithoutExtension: string,
  image: DownloadedImage,
): Promise<string> {
  const path = `${pathWithoutExtension}.${image.extension}`;

  const { error } = await supabase.storage.from(bucket).upload(path, image.buffer, {
    contentType: image.contentType,
    upsert: true,
  });

  if (error) {
    throw new Error(`Storage upload failed for ${bucket}/${path}: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function storeCompetitionLogo(competition: FootballDataCompetition): Promise<string | null> {
  if (!competition.emblem || !competition.code) return null;

  try {
    const image = await downloadImage(competition.emblem);
    return await uploadImageToBucket("competitions_logo", competition.code.toLowerCase(), image);
  } catch (error) {
    console.warn(`Failed storing logo for ${competition.code}:`, getErrorMessage(error));
    return null;
  }
}

async function storeCompetitionFlag(competition: FootballDataCompetition): Promise<string | null> {
  const flagUrl = competition.area?.flag;
  if (!flagUrl) return null;

  try {
    const image = await downloadImage(flagUrl);
    const areaPath = sanitizeStoragePath(competition.area?.name ?? "area");
    return await uploadImageToBucket("flags", areaPath, image);
  } catch (error) {
    console.warn(`Failed storing flag for ${competition.code}:`, getErrorMessage(error));
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Database                                                                   */
/* -------------------------------------------------------------------------- */

async function getExistingCompetition(competitionId: number): Promise<ExistingCompetition | null> {
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
    throw new Error(`Failed reading competition ${competitionId}: ${error.message}`);
  }

  return data as ExistingCompetition | null;
}

async function upsertCompetition(params: {
  apiCompetition: FootballDataCompetition;
  targetCompetition: TargetCompetition;
  existingCompetition: ExistingCompetition | null;
  scheduleInfo: CompetitionScheduleInfo;
  uploadedLogo: string | null;
  uploadedFlag: string | null;
}): Promise<void> {
  const {
    apiCompetition,
    targetCompetition,
    existingCompetition,
    scheduleInfo,
    uploadedLogo,
    uploadedFlag,
  } = params;

  const season = apiCompetition.currentSeason;
  const isChampionsLeague = targetCompetition.scheduleType === "CHAMPIONS_LEAGUE";

  const record = {
    id: apiCompetition.id,
    name: targetCompetition.name || apiCompetition.name,
    code: targetCompetition.code,
    type: apiCompetition.type,
    logo: uploadedLogo ?? existingCompetition?.logo ?? null,
    area: apiCompetition.area?.name ?? null,
    flag: uploadedFlag ?? existingCompetition?.flag ?? null,
    season_id: season?.id ?? null,
    season_start: season?.startDate ?? null,
    season_end: season?.endDate ?? null,

    /*
     * CL בנוקאאוט חייבת לקבל null.
     * לכן אין fallback ל-current_fixture הקודם במקרה הזה.
     */
    current_fixture: isChampionsLeague
      ? scheduleInfo.currentFixture
      : scheduleInfo.currentFixture ??
        season?.currentMatchday ??
        existingCompetition?.current_fixture ??
        null,

    total_fixtures: scheduleInfo.totalFixtures ?? existingCompetition?.total_fixtures ?? 0,

    current_stage:
      scheduleInfo.currentStage ??
      (isChampionsLeague ? null : existingCompetition?.current_stage ?? "REGULAR_SEASON"),

    is_free: targetCompetition.isFree,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("competitions").upsert(record, { onConflict: "id" });

  if (error) {
    throw new Error(`Failed upserting ${targetCompetition.code}: ${error.message}`);
  }
}

/* -------------------------------------------------------------------------- */
/* Single competition sync                                                    */
/* -------------------------------------------------------------------------- */

async function syncCompetition(
  apiCompetition: FootballDataCompetition,
  targetCompetition: TargetCompetition,
): Promise<void> {
  console.log(`Starting sync for ${targetCompetition.code}`);

  const existingCompetition = await getExistingCompetition(apiCompetition.id);

  // fdFetch is sequential-only — fetch the schedule FIRST, then download images
  // in parallel (plain image fetches, not the rate-limited API host).
  const scheduleInfo = await getCompetitionScheduleInfo(targetCompetition);

  const [uploadedLogo, uploadedFlag] = await Promise.all([
    storeCompetitionLogo(apiCompetition),
    storeCompetitionFlag(apiCompetition),
  ]);

  await upsertCompetition({
    apiCompetition,
    targetCompetition,
    existingCompetition,
    scheduleInfo,
    uploadedLogo,
    uploadedFlag,
  });

  console.log(`Synced ${targetCompetition.code}`, {
    currentFixture: scheduleInfo.currentFixture,
    totalFixtures: scheduleInfo.totalFixtures,
    currentStage: scheduleInfo.currentStage,
  });
}

/* -------------------------------------------------------------------------- */
/* Environment                                                                */
/* -------------------------------------------------------------------------- */

function validateEnvironment(): void {
  if (!SUPABASE_URL) throw new Error("SUPABASE_URL is not set");
  if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  if (!FD_KEY) throw new Error("FOOTBALL_ORG_API_KEY is not set");
}

/* -------------------------------------------------------------------------- */
/* Edge Function                                                              */
/* -------------------------------------------------------------------------- */

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return createJsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  // Shared auth: accepts x-sync-secret OR the service-role key as Bearer
  // (which is what the Supabase dashboard "Invoke" button sends).
  const denied = requireSyncAuth(request);
  if (denied) return denied;

  try {
    validateEnvironment();

    // Overlap guard — don't run two syncs at once.
    if (!(await tryAcquireSyncLock(supabase, JOB, 300))) return lockedResponse(JOB);

    try {
      const apiCompetitions = await fetchTargetCompetitions();
      const targetByCode = new Map(
        TARGET_COMPETITIONS.map((competition) => [competition.code, competition] as const),
      );

      const syncedCodes: string[] = [];
      const failures: SyncFailure[] = [];

      // Sequential loop — required because fdFetch must run one call at a time.
      for (const apiCompetition of apiCompetitions) {
        const competitionCode = apiCompetition.code;
        if (!competitionCode) continue;

        const targetCompetition = targetByCode.get(competitionCode);
        if (!targetCompetition) continue;

        try {
          await syncCompetition(apiCompetition, targetCompetition);
          syncedCodes.push(competitionCode);
        } catch (error) {
          const message = getErrorMessage(error);
          console.error(`Failed syncing ${competitionCode}:`, message);
          failures.push({ code: competitionCode, error: message });
        }
      }

      const returnedCodes = new Set(
        apiCompetitions
          .map((competition) => competition.code)
          .filter((code): code is string => typeof code === "string"),
      );

      const missingCodes = TARGET_COMPETITIONS.map((competition) => competition.code).filter(
        (code) => !returnedCodes.has(code),
      );

      const success = failures.length === 0 && missingCodes.length === 0;

      await releaseSyncLock(supabase, JOB, failures.length > 0 ? "error" : "success");

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
        failures.length > 0 ? 207 : 200,
      );
    } catch (error) {
      await releaseSyncLock(supabase, JOB, "error");
      throw error;
    }
  } catch (error) {
    return errorResponse(JOB, error);
  }
});
