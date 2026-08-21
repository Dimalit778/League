// Shared competition configuration, Football-Data stage/status constants,
// match utilities and fetch helpers used by BOTH competition sync functions:
//
//   sync-competitions           → stable metadata + total_matchdays + images
//   sync-competition-progress   → daily current_matchday / current_stage
//
// Every Football-Data request here goes through the shared, rate-limited,
// sequential fdFetch (DB-backed 10-calls/minute limiter). Do NOT call these
// helpers inside Promise.all — fdFetch must run one request at a time.
//
// deno-lint-ignore-file no-explicit-any
import { FD_BASE, fdFetch } from "./sync.ts";
import type { FootballDataCompetition } from "./competition-assets.ts";

/* -------------------------------------------------------------------------- */
/* Target competitions                                                        */
/* -------------------------------------------------------------------------- */

export type CompetitionKind = "REGULAR" | "CHAMPIONS_LEAGUE";

export type TargetCompetition = {
  name: string;
  code: string;
  areaId: number;
  isFree: boolean;
  kind: CompetitionKind;
};

// Business-specific configuration (name / areaId / isFree) carried over from
// the previous sync-all-competitions implementation unchanged.
export const TARGET_COMPETITIONS: TargetCompetition[] = [
  { name: "La Liga", code: "PD", areaId: 2224, isFree: true, kind: "REGULAR" },
  { name: "Bundesliga", code: "BL1", areaId: 2088, isFree: true, kind: "REGULAR" },
  { name: "Premier League", code: "PL", areaId: 2072, isFree: false, kind: "REGULAR" },
  { name: "Serie A", code: "SA", areaId: 2114, isFree: false, kind: "REGULAR" },
  { name: "Ligue 1", code: "FL1", areaId: 2081, isFree: false, kind: "REGULAR" },
  { name: "UEFA Champions League", code: "CL", areaId: 2077, isFree: false, kind: "CHAMPIONS_LEAGUE" },
];

export const REGULAR_LEAGUE_CODES = TARGET_COMPETITIONS
  .filter((competition) => competition.kind === "REGULAR")
  .map((competition) => competition.code);

export const CHAMPIONS_LEAGUE_CODE = "CL";

export function getUniqueTargetAreaIds(): number[] {
  return [...new Set(TARGET_COMPETITIONS.map((competition) => competition.areaId))];
}

export function getTargetByCode(): Map<string, TargetCompetition> {
  return new Map(TARGET_COMPETITIONS.map((competition) => [competition.code, competition] as const));
}

/* -------------------------------------------------------------------------- */
/* Stages                                                                     */
/* -------------------------------------------------------------------------- */

// Explicit Champions League league-phase stages. total_matchdays and the
// "current matchday" for CL are derived ONLY from these — never from a broad
// `!isKnockoutStage()`, which would let qualification rounds leak in.
//
// LEAGUE_STAGE  → the current (2024+) 36-team league phase.
// GROUP_STAGE   → the historical group phase (defensive: older seasons / cache).
// REGULAR_SEASON→ observed defensively in some Football-Data responses; kept as
//                 a fallback with this comment because it is not a documented CL
//                 stage but has appeared in real payloads.
export const CHAMPIONS_LEAGUE_LEAGUE_PHASE_STAGES = new Set<string>([
  "LEAGUE_STAGE",
  "GROUP_STAGE",
  "REGULAR_SEASON",
]);

// Knockout / non-league-phase stages, used only for clarity in logs and guards.
export const KNOCKOUT_STAGES = new Set<string>([
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
]);

export function isChampionsLeagueLeaguePhase(stage: string | null): boolean {
  return stage !== null && CHAMPIONS_LEAGUE_LEAGUE_PHASE_STAGES.has(stage);
}

export function isKnockoutStage(stage: string | null): boolean {
  return stage !== null && KNOCKOUT_STAGES.has(stage);
}

/* -------------------------------------------------------------------------- */
/* Match statuses                                                             */
/* -------------------------------------------------------------------------- */

// A match that actually took place and produced a result.
//
// NOTE (intentional change from the old sync-all-competitions):
// CANCELLED is NOT treated as completed. A cancelled match was never played,
// so counting it as "finished" could push tournament progression forward
// incorrectly (e.g. advance the CL stage). It is instead ignored entirely for
// active-stage detection (see IGNORED_MATCH_STATUSES) so it neither advances
// progress nor gets picked as the perpetual "next unfinished" match.
export const COMPLETED_MATCH_STATUSES = new Set<string>([
  "FINISHED",
  "AWARDED",
]);

// Matches that should not influence current stage / matchday detection at all.
export const IGNORED_MATCH_STATUSES = new Set<string>([
  "CANCELLED",
]);

/* -------------------------------------------------------------------------- */
/* Match types & utilities                                                    */
/* -------------------------------------------------------------------------- */

export type FootballDataMatch = {
  id: number;
  utcDate: string;
  status: string;
  stage: string | null;
  matchday: number | null;
};

export type FootballDataMatchesResponse = {
  matches?: FootballDataMatch[];
};

export type FootballDataCompetitionsResponse = {
  count?: number;
  competitions?: FootballDataCompetition[];
};

export function isCompletedMatch(match: FootballDataMatch): boolean {
  return COMPLETED_MATCH_STATUSES.has(match.status);
}

export function isIgnoredMatch(match: FootballDataMatch): boolean {
  return IGNORED_MATCH_STATUSES.has(match.status);
}

function getMatchTimestamp(match: FootballDataMatch): number {
  const timestamp = new Date(match.utcDate).getTime();
  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

export function sortMatchesByDate(matches: FootballDataMatch[]): FootballDataMatch[] {
  return [...matches].sort((first, second) => getMatchTimestamp(first) - getMatchTimestamp(second));
}

// Earliest not-yet-played match, ignoring cancelled matches. Drives "current".
export function findNextUnfinishedMatch(matches: FootballDataMatch[]): FootballDataMatch | null {
  const unfinished = matches.filter(
    (match) => !isCompletedMatch(match) && !isIgnoredMatch(match),
  );
  return sortMatchesByDate(unfinished)[0] ?? null;
}

// Latest played match. Fallback once every match is finished.
export function findLatestFinishedMatch(matches: FootballDataMatch[]): FootballDataMatch | null {
  const finished = matches.filter(isCompletedMatch);
  return sortMatchesByDate(finished).at(-1) ?? null;
}

// Unique numeric matchdays present in the given matches.
export function getUniqueMatchdays(matches: FootballDataMatch[]): number[] {
  const matchdays = matches
    .map((match) => match.matchday)
    .filter((matchday): matchday is number => typeof matchday === "number");
  return [...new Set(matchdays)].sort((first, second) => first - second);
}

/* -------------------------------------------------------------------------- */
/* Football-Data fetch helpers (all rate-limited, sequential)                 */
/* -------------------------------------------------------------------------- */

// One /competitions request returning every target competition (all 6 areas).
export async function fetchTargetCompetitions(
  supabase: any,
  job: string,
  fdKey: string,
): Promise<FootballDataCompetition[]> {
  const url = new URL(`${FD_BASE}/competitions`);
  url.searchParams.set("areas", getUniqueTargetAreaIds().join(","));

  const payload = (await fdFetch(supabase, job, url.toString(), fdKey)) as FootballDataCompetitionsResponse;
  const competitions = Array.isArray(payload.competitions) ? payload.competitions : [];

  const targetCodes = new Set(TARGET_COMPETITIONS.map((competition) => competition.code));
  return competitions.filter(
    (competition): competition is FootballDataCompetition & { code: string } =>
      typeof competition.code === "string" && targetCodes.has(competition.code),
  );
}

// All matches for a single competition (season schedule).
export async function fetchCompetitionMatches(
  supabase: any,
  job: string,
  fdKey: string,
  competitionCode: string,
): Promise<FootballDataMatch[]> {
  const url = `${FD_BASE}/competitions/${competitionCode}/matches`;
  const payload = (await fdFetch(supabase, job, url, fdKey)) as FootballDataMatchesResponse;
  return Array.isArray(payload.matches) ? payload.matches : [];
}
