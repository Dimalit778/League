import { MatchWithPredictionsType } from '../../types';
import {
  filterMatchesByGroup,
  getGroupStageMatches,
  getKnockoutStages,
  getStageLabel,
  getTournamentGroups,
  hasLeagueStage,
  isFirstPhaseStage,
  groupMatchesByFixture,
  isLeagueCompetition,
  normalizedGroupLetter,
  selectKnockoutMatches,
  splitTournamentMatches,
} from '../tournamentMatches';

const match = (id: number, overrides: Partial<MatchWithPredictionsType> = {}): MatchWithPredictionsType =>
  ({
    id,
    fixture: 1,
    stage: null,
    group: null,
    kick_off: `2026-06-${String(id).padStart(2, '0')}T12:00:00Z`,
    predictions: [],
    ...overrides,
  }) as MatchWithPredictionsType;

describe('tournamentMatches utils', () => {
  it('detects regular league competition type', () => {
    expect(isLeagueCompetition('league')).toBe(true);
    expect(isLeagueCompetition('League')).toBe(true);
    expect(isLeagueCompetition('Cup')).toBe(false);
    expect(isLeagueCompetition(undefined)).toBe(false);
  });

  it('builds sorted group list from group stage matches', () => {
    const matches = [
      match(1, { stage: 'GROUP_STAGE', group: 'B' }),
      match(2, { stage: 'GROUP_STAGE', group: 'A' }),
      match(3, { stage: 'FINAL', group: 'C' }),
      match(4, { stage: 'GROUP_STAGE', group: 'GROUP_A' }),
      match(5, { stage: 'REGULAR_SEASON', group: 'League' }),
    ];

    expect(getTournamentGroups(matches)).toEqual(['A', 'B']);
  });

  it('detects first phase stages and league phase matches', () => {
    expect(isFirstPhaseStage('GROUP_STAGE')).toBe(true);
    expect(isFirstPhaseStage('REGULAR_SEASON')).toBe(true);
    expect(isFirstPhaseStage('FINAL')).toBe(false);
    expect(hasLeagueStage([match(1, { stage: 'REGULAR_SEASON' })])).toBe(true);
    expect(hasLeagueStage([match(1, { stage: 'GROUP_STAGE' })])).toBe(false);
  });

  it('normalizes group names to a single letter for tabs and dedupes', () => {
    const matches = [
      match(1, { stage: 'GROUP_STAGE', group: 'Group B' }),
      match(2, { stage: 'GROUP_STAGE', group: 'GROUP_A' }),
      match(3, { stage: 'GROUP_STAGE', group: 'A' }),
    ];

    expect(getTournamentGroups(matches)).toEqual(['A', 'B']);
    expect(normalizedGroupLetter('Group C')).toBe('C');
    expect(normalizedGroupLetter('GROUP_D')).toBe('D');
  });

  it('orders knockout stages by known tournament order and then alphabetically', () => {
    const matches = [
      match(1, { stage: 'FINAL' }),
      match(2, { stage: 'ROUND_OF_16' }),
      match(3, { stage: 'PLAYOFF' }),
      match(4, { stage: 'QUARTER_FINALS' }),
      match(5, { stage: 'GROUP_STAGE' }),
      match(6, { stage: 'LAST_32' }),
      match(7, { stage: 'THIRD_PLACE' }),
      match(8, { stage: 'SEMI_FINALS' }),
      match(9, { stage: 'LAST_4' }),
      match(10, { stage: 'LAST_8' }),
      match(11, { stage: 'LAST_16' }),
    ];

    expect(getKnockoutStages(matches)).toEqual([
      'LAST_32',
      'LAST_16',
      'ROUND_OF_16',
      'LAST_8',
      'QUARTER_FINALS',
      'LAST_4',
      'SEMI_FINALS',
      'THIRD_PLACE',
      'FINAL',
    ]);
  });

  it('groups matches by fixture and sorts each section by kick off', () => {
    const matches = [
      match(1, { fixture: 2, kick_off: '2026-06-02T18:00:00Z' }),
      match(2, { fixture: 1, kick_off: '2026-06-01T18:00:00Z' }),
      match(3, { fixture: 2, kick_off: '2026-06-02T12:00:00Z' }),
    ];

    const sections = groupMatchesByFixture(matches);
    expect(sections.map((section) => section.fixture)).toEqual([1, 2]);
    expect(sections[1].matches.map((item) => item.id)).toEqual([3, 1]);
  });

  it('maps known stage labels and prettifies unknown labels', () => {
    expect(getStageLabel('REGULAR_SEASON')).toBe('League Phase');
    expect(getStageLabel('ROUND_OF_16')).toBe('Round of 16');
    expect(getStageLabel('LAST_32')).toBe('Last 32');
    expect(getStageLabel('LAST_16')).toBe('Last 16');
    expect(getStageLabel('LAST_8')).toBe('Last 8');
    expect(getStageLabel('QUARTER_FINALS')).toBe('Quarter Finals');
    expect(getStageLabel('SEMI_FINALS')).toBe('Semi Finals');
    expect(getStageLabel('THIRD_PLACE')).toBe('Third-Fourth');
    expect(getStageLabel('UNKNOWN_STAGE')).toBe('UNKNOWN STAGE');
  });

  it('splits tournament matches into first phase and knockout buckets', () => {
    const matches = [
      match(1, { stage: 'GROUP_STAGE' }),
      match(2, { stage: 'FINAL' }),
      match(3, { stage: 'REGULAR_SEASON' }),
    ];

    expect(splitTournamentMatches(matches)).toEqual({
      firstPhase: [matches[0], matches[2]],
      knockoutStages: [matches[1]],
    });
  });

  it('filters group stage and knockout matches from a full competition list', () => {
    const matches = [
      match(1, { stage: 'GROUP_STAGE', group: 'A' }),
      match(2, { stage: 'FINAL' }),
      match(3, { stage: 'REGULAR_SEASON' }),
    ];

    expect(getGroupStageMatches(matches)).toEqual([matches[0]]);
    expect(selectKnockoutMatches(matches)).toEqual([matches[1]]);
    expect(filterMatchesByGroup(matches, 'A')).toEqual([matches[0]]);
  });
});
