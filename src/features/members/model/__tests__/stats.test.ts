import type { PredictionRow } from '../../types/stats.type';
import {
  computeBestCategory,
  computeRecentForm,
  computeRoundPerformance,
  computeStreaks,
} from '../stats';

const row = (
  points: number | null,
  is_finished: boolean,
  kickOffMinute: number,
  fixture: number | null = 1,
): PredictionRow => ({
  points,
  is_finished,
  matches: { fixture, kick_off: `2026-08-15T${String(kickOffMinute).padStart(2, '0')}:00:00.000Z` },
});

describe('computeStreaks', () => {
  it('tracks the longest and current scoring streaks in kick-off order', () => {
    const predictions = [
      row(3, true, 10),
      row(5, true, 11),
      row(0, true, 12),
      row(3, true, 13),
      row(3, true, 14),
    ];
    expect(computeStreaks(predictions)).toEqual({ currentStreak: 2, longestStreak: 2 });
  });

  it('resets the current streak after a scoreless prediction', () => {
    expect(computeStreaks([row(5, true, 10), row(0, true, 11)])).toEqual({
      currentStreak: 0,
      longestStreak: 1,
    });
  });

  it('ignores unfinished predictions', () => {
    expect(computeStreaks([row(5, false, 10)])).toEqual({ currentStreak: 0, longestStreak: 0 });
  });
});

describe('computeRecentForm', () => {
  it('returns the last five finished results mapped to B/H/L', () => {
    const predictions = [row(5, true, 10), row(3, true, 11), row(0, true, 12)];
    expect(computeRecentForm(predictions)).toEqual([
      { points: 5, result: 'B' },
      { points: 3, result: 'H' },
      { points: 0, result: 'L' },
    ]);
  });

  it('keeps only the five most recent by kick-off', () => {
    const predictions = [1, 2, 3, 4, 5, 6].map((m) => row(3, true, m));
    expect(computeRecentForm(predictions)).toHaveLength(5);
  });
});

describe('computeRoundPerformance', () => {
  it('sums finished points per fixture, sorted by round', () => {
    const predictions = [
      row(3, true, 10, 2),
      row(5, true, 11, 1),
      row(3, true, 12, 1),
      row(3, false, 13, 3),
    ];
    expect(computeRoundPerformance(predictions)).toEqual([
      { round: 1, points: 8 },
      { round: 2, points: 3 },
    ]);
  });
});

describe('computeBestCategory', () => {
  it('picks the higher of correct scores vs correct results', () => {
    const best = computeBestCategory({ bingoHits: 2, regularHits: 5, rank: 3, totalMembers: 10 });
    expect(best.name).toBe('Correct results');
    expect(best.value).toBe(5);
    expect(best.topPercent).toBe(30);
  });

  it('returns null percentile for an unranked member (rank 0), not top 1%', () => {
    const best = computeBestCategory({ bingoHits: 1, regularHits: 0, rank: 0, totalMembers: 10 });
    expect(best.topPercent).toBeNull();
  });

  it('returns null percentile when there are no members', () => {
    const best = computeBestCategory({ bingoHits: 1, regularHits: 0, rank: 1, totalMembers: 0 });
    expect(best.topPercent).toBeNull();
  });
});
