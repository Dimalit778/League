import type { MatchCardType } from '../types';
import { matchesApi as legacyMatchesApi } from '../regularLeague/api/matchesService';

/**
 * All match queries. `getSeasonMatches` loads the whole competition once;
 * every Matches view slices it client-side (see model/selectors, model/knockout).
 */
export const matchesApi = {
  ...legacyMatchesApi,
  getSeasonMatches: (competitionId: number, memberId: string): Promise<MatchCardType[]> =>
    legacyMatchesApi.getCompetitionMatchesWithMemberPredictions(competitionId, memberId),
};
