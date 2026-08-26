import { Tables } from '@/types/database.types';

export type CurrentSeason = Pick<
  Tables<'seasons'>,
  | 'id'
  | 'competition_id'
  | 'current_matchday'
  | 'current_stage'
  | 'total_matchdays'
  | 'season_start'
  | 'season_end'
  | 'is_current'
>;

export type CompetitionWithCurrentSeason = Tables<'competitions'> & {
  currentSeason: CurrentSeason | null;
};

export type CompetitionWithSeasonRows = Tables<'competitions'> & {
  seasons: CurrentSeason[] | null;
};

export function resolveCurrentSeason(
  seasons: CurrentSeason[] | null | undefined,
): CurrentSeason | null {
  return seasons?.find((season) => season.is_current) ?? null;
}

export function normalizeCompetition(
  competition: CompetitionWithSeasonRows,
): CompetitionWithCurrentSeason {
  const { seasons, ...metadata } = competition;
  return {
    ...metadata,
    currentSeason: resolveCurrentSeason(seasons),
  };
}
