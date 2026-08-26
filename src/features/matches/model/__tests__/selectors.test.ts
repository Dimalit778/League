import type { MatchListItem } from '../../types';
import { selectByFixture, selectFixtures, selectGroups } from '../selectors';

const mk = (o: Partial<MatchListItem>): MatchListItem =>
  ({
    id: 0,
    fixture: 1,
    stage: null,
    group: null,
    kick_off: '2026-06-01T12:00:00Z',
    home_team_id: 1,
    away_team_id: 2,
    status: 'SCHEDULED',
    score: null,
    home_team: null,
    away_team: null,
    prediction: null,
    ...o,
  }) as MatchListItem;

describe('selectors', () => {
  it('lists unique sorted fixtures', () => {
    expect(selectFixtures([mk({ fixture: 3 }), mk({ fixture: 1 }), mk({ fixture: 3 })])).toEqual([1, 3]);
  });

  it('filters a fixture and sorts by kick_off', () => {
    const a = mk({ id: 1, fixture: 2, kick_off: '2026-06-02T18:00:00Z' });
    const b = mk({ id: 2, fixture: 2, kick_off: '2026-06-02T12:00:00Z' });
    const c = mk({ id: 3, fixture: 1 });
    expect(selectByFixture([a, b, c], 2).map((m) => m.id)).toEqual([2, 1]);
  });

  it('builds groups slice with matches and standings per group', () => {
    const g = selectGroups([
      mk({ id: 1, stage: 'GROUP_STAGE', group: 'A' }),
      mk({ id: 2, stage: 'GROUP_STAGE', group: 'Group B' }),
    ]);
    expect(g.groups).toEqual(['A', 'B']);
    expect(g.matchesByGroup['A'].map((m) => m.id)).toEqual([1]);
    expect(Array.isArray(g.standingsByGroup['A'])).toBe(true);
  });
});
