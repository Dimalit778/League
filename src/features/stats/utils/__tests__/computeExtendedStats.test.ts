import {
  computeBestCategory,
  computeRoundPerformance,
  computeStreaks,
  getAccuracyMessage,
} from '../computeExtendedStats';

describe('computeExtendedStats', () => {
  const predictions = [
    { points: 5, is_finished: true, matches: { fixture: 1, kick_off: '2024-01-01' } },
    { points: 3, is_finished: true, matches: { fixture: 1, kick_off: '2024-01-02' } },
    { points: 0, is_finished: true, matches: { fixture: 2, kick_off: '2024-01-03' } },
    { points: 5, is_finished: true, matches: { fixture: 2, kick_off: '2024-01-04' } },
    { points: 3, is_finished: true, matches: { fixture: 3, kick_off: '2024-01-05' } },
  ];

  it('computes streaks from finished predictions', () => {
    expect(computeStreaks(predictions)).toEqual({ currentStreak: 2, longestStreak: 2 });
  });

  it('computes round performance grouped by fixture', () => {
    expect(computeRoundPerformance(predictions)).toEqual([
      { round: 1, points: 8 },
      { round: 2, points: 5 },
      { round: 3, points: 3 },
    ]);
  });

  it('picks best category by highest count', () => {
    expect(
      computeBestCategory({ bingoHits: 12, regularHits: 8, position: 4, totalMembers: 22 }),
    ).toEqual({
      name: 'Correct scores',
      value: 12,
      topPercent: 18,
    });
  });

  it('returns accuracy message tiers', () => {
    expect(getAccuracyMessage(75)).toBe('great');
    expect(getAccuracyMessage(55)).toBe('good');
    expect(getAccuracyMessage(30)).toBe('improve');
  });
});
