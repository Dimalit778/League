/** API-style competition / bracket stages (e.g. football-data.org style). */
export const TOURNAMENT_STAGES = [
  'FINAL',
  'THIRD_PLACE',
  'SEMI_FINALS',
  'QUARTER_FINALS',
  'LAST_16',
  'LAST_32',
  'LAST_64',
  'ROUND_4',
  'ROUND_3',
  'ROUND_2',
  'ROUND_1',
  'GROUP_STAGE',
  'PRELIMINARY_ROUND',
  'QUALIFICATION',
  'QUALIFICATION_ROUND_1',
  'QUALIFICATION_ROUND_2',
  'QUALIFICATION_ROUND_3',
  'PLAYOFF_ROUND_1',
  'PLAYOFF_ROUND_2',
  'PLAYOFFS',
  'REGULAR_SEASON',
  'CLAUSURA',
  'APERTURA',
  'CHAMPIONSHIP_ROUND',
  'RELEGATION_ROUND',
] as const;

export type TournamentStage = (typeof TOURNAMENT_STAGES)[number];

export const TOURNAMENT_GROUPS = [
  'GROUP_A',
  'GROUP_B',
  'GROUP_C',
  'GROUP_D',
  'GROUP_E',
  'GROUP_F',
  'GROUP_G',
  'GROUP_H',
  'GROUP_I',
  'GROUP_J',
  'GROUP_K',
  'GROUP_L',
] as const;

export type TournamentGroup = (typeof TOURNAMENT_GROUPS)[number];

const TOURNAMENT_STAGE_SET = new Set<string>(TOURNAMENT_STAGES);

/** Domestic league calendar — fixture list (round-robin) UI. */
const DOMESTIC_LEAGUE_STAGES = new Set<string>([
  'REGULAR_SEASON',
  'LEAGUE_STAGE',
  'CLAUSURA',
  'APERTURA',
  'CHAMPIONSHIP_ROUND',
  'RELEGATION_ROUND',
]);

/** Cup-style group / qualification / play-in — groups + knockout shell. */
const GROUP_PHASE_STAGES = new Set<string>([
  'GROUP_STAGE',
  'PRELIMINARY_ROUND',
  'QUALIFICATION',
  'QUALIFICATION_ROUND_1',
  'QUALIFICATION_ROUND_2',
  'QUALIFICATION_ROUND_3',
  'PLAYOFF_ROUND_1',
  'PLAYOFF_ROUND_2',
  'PLAYOFFS',
]);

/** Knockout bracket rounds (no group table). */
const KNOCKOUT_ONLY_STAGES = new Set<string>([
  'FINAL',
  'THIRD_PLACE',
  'SEMI_FINALS',
  'QUARTER_FINALS',
  'LAST_16',
  'LAST_32',
  'LAST_64',
  'ROUND_4',
  'ROUND_3',
  'ROUND_2',
  'ROUND_1',
]);

export function parseTournamentStage(value: string | null | undefined): TournamentStage | null {
  const key = value?.trim().toUpperCase();
  if (!key || !TOURNAMENT_STAGE_SET.has(key)) return null;
  return key as TournamentStage;
}

export function parseTournamentGroup(value: string | null | undefined): TournamentGroup | null {
  const key = value?.trim().toUpperCase();
  if (!key) return null;
  return (TOURNAMENT_GROUPS as readonly string[]).includes(key) ? (key as TournamentGroup) : null;
}

export function isDomesticLeagueStage(stage: string | null | undefined): boolean {
  const key = stage?.trim().toUpperCase();
  return key != null && DOMESTIC_LEAGUE_STAGES.has(key);
}

export function isGroupPhaseStage(stage: string | null | undefined): boolean {
  const key = stage?.trim().toUpperCase();
  return key != null && GROUP_PHASE_STAGES.has(key);
}

export function isKnockoutOnlyStage(stage: string | null | undefined): boolean {
  const key = stage?.trim().toUpperCase();
  return key != null && KNOCKOUT_ONLY_STAGES.has(key);
}
