import type { MatchCardType } from '../types';
import {
  ComputedStandingRow,
  computeLeagueStandings,
  filterMatchesByGroup,
  getLeagueFixtures,
  getMatchesByFixture,
  getTournamentGroups,
} from '../utils/tournamentMatches';

export const selectFixtures = (matches: MatchCardType[]): number[] => getLeagueFixtures(matches);

export const selectByFixture = (matches: MatchCardType[], fixture: number): MatchCardType[] =>
  getMatchesByFixture(matches, fixture);

export type GroupsSlice = {
  groups: string[];
  matchesByGroup: Record<string, MatchCardType[]>;
  standingsByGroup: Record<string, ComputedStandingRow[]>;
};

export const selectGroups = (matches: MatchCardType[]): GroupsSlice => {
  const groups = getTournamentGroups(matches);
  const matchesByGroup: Record<string, MatchCardType[]> = {};
  const standingsByGroup: Record<string, ComputedStandingRow[]> = {};

  for (const group of groups) {
    const groupMatches = filterMatchesByGroup(matches, group);
    matchesByGroup[group] = groupMatches;
    standingsByGroup[group] = computeLeagueStandings(groupMatches);
  }

  return { groups, matchesByGroup, standingsByGroup };
};
