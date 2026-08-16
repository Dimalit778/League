import type { MatchListItem } from '../types';
import {
  ComputedStandingRow,
  computeLeagueStandings,
  filterMatchesByGroup,
  getLeagueFixtures,
  getMatchesByFixture,
  getTournamentGroups,
} from '../utils/tournamentMatches';

export const selectFixtures = (matches: MatchListItem[]): number[] => getLeagueFixtures(matches);

export const selectByFixture = (matches: MatchListItem[], fixture: number): MatchListItem[] =>
  getMatchesByFixture(matches, fixture);

export type GroupsSlice = {
  groups: string[];
  matchesByGroup: Record<string, MatchListItem[]>;
  standingsByGroup: Record<string, ComputedStandingRow[]>;
};

export const selectGroups = (matches: MatchListItem[]): GroupsSlice => {
  const groups = getTournamentGroups(matches);
  const matchesByGroup: Record<string, MatchListItem[]> = {};
  const standingsByGroup: Record<string, ComputedStandingRow[]> = {};

  for (const group of groups) {
    const groupMatches = filterMatchesByGroup(matches, group);
    matchesByGroup[group] = groupMatches;
    standingsByGroup[group] = computeLeagueStandings(groupMatches);
  }

  return { groups, matchesByGroup, standingsByGroup };
};
