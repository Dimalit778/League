import type { MatchListItem } from '../types';
import { isGroupPhaseStage } from '../types/footballStages';
import {
  ComputedStandingRow,
  computeLeagueStandings,
  getLeagueFixtures,
  getMatchesByFixture,
  normalizedGroupLetter,
} from '../utils/tournamentMatches';

export const selectFixtures = (matches: MatchListItem[]): number[] => getLeagueFixtures(matches);

export const selectByFixture = (matches: MatchListItem[], fixture: number): MatchListItem[] =>
  getMatchesByFixture(matches, fixture);

export type FixtureIndex = {
  fixtures: number[];
  matchesByFixture: Map<number, MatchListItem[]>;
  dateBoundsByFixture: Map<number, { start: number; end: number }>;
};

/**
 * Indexes a season in one pass. Match buckets preserve the API's kick-off
 * ordering, while date bounds are calculated independently of input order.
 */
export const selectFixtureIndex = (matches: MatchListItem[]): FixtureIndex => {
  const matchesByFixture = new Map<number, MatchListItem[]>();
  const dateBoundsByFixture = new Map<number, { start: number; end: number }>();

  for (const match of matches) {
    const fixture = match.fixture;
    if (fixture == null) continue;

    const fixtureMatches = matchesByFixture.get(fixture);
    if (fixtureMatches) fixtureMatches.push(match);
    else matchesByFixture.set(fixture, [match]);

    const kickOff = Date.parse(match.kick_off);
    if (!Number.isFinite(kickOff)) continue;

    const bounds = dateBoundsByFixture.get(fixture);
    if (!bounds) {
      dateBoundsByFixture.set(fixture, { start: kickOff, end: kickOff });
    } else {
      if (kickOff < bounds.start) bounds.start = kickOff;
      if (kickOff > bounds.end) bounds.end = kickOff;
    }
  }

  const fixtures = [...matchesByFixture.keys()].sort((a, b) => a - b);
  return { fixtures, matchesByFixture, dateBoundsByFixture };
};

export type GroupsSlice = {
  groups: string[];
  matchesByGroup: Record<string, MatchListItem[]>;
  standingsByGroup: Record<string, ComputedStandingRow[]>;
};

export const selectGroups = (matches: MatchListItem[]): GroupsSlice => {
  const groupBuckets = new Map<string, MatchListItem[]>();
  const matchesByGroup: Record<string, MatchListItem[]> = {};
  const standingsByGroup: Record<string, ComputedStandingRow[]> = {};

  for (const match of matches) {
    if (!isGroupPhaseStage(match.stage)) continue;

    const group = normalizedGroupLetter(match.group);
    if (!group) continue;

    const groupMatches = groupBuckets.get(group);
    if (groupMatches) groupMatches.push(match);
    else groupBuckets.set(group, [match]);
  }

  const groups = [...groupBuckets.keys()].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );

  for (const group of groups) {
    const groupMatches = groupBuckets.get(group) ?? [];
    matchesByGroup[group] = groupMatches;
    standingsByGroup[group] = computeLeagueStandings(groupMatches);
  }

  return { groups, matchesByGroup, standingsByGroup };
};
