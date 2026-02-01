import { computePredictionStats } from '../stats';

// Create mock prediction rows matching the expected shape
const createRow = (overrides: any = {}) => ({
  is_finished: false,
  score: null as any,
  predicted_home_score: 0,
  predicted_away_score: 0,
  ...overrides,
});

describe('computePredictionStats', () => {
  it('returns zeros for empty array', () => {
    const result = computePredictionStats([]);
    expect(result).toEqual({
      total: 0,
      finished: 0,
      bingo: 0,
      hit: 0,
      miss: 0,
      accuracy: 0,
    });
  });

  it('counts total predictions', () => {
    const rows = [createRow(), createRow(), createRow()];
    const result = computePredictionStats(rows);
    expect(result.total).toBe(3);
  });

  it('counts only finished predictions', () => {
    const rows = [
      createRow({ is_finished: true, score: { fullTime: { home: 1, away: 0 } } }),
      createRow({ is_finished: false }),
    ];
    const result = computePredictionStats(rows);
    expect(result.finished).toBe(1);
  });

  it('detects bingo (exact score match)', () => {
    const rows = [
      createRow({
        is_finished: true,
        score: { fullTime: { home: 2, away: 1 } },
        predicted_home_score: 2,
        predicted_away_score: 1,
      }),
    ];
    const result = computePredictionStats(rows);
    expect(result.bingo).toBe(1);
    expect(result.hit).toBe(0);
    expect(result.miss).toBe(0);
  });

  it('detects hit (correct outcome, wrong score)', () => {
    const rows = [
      createRow({
        is_finished: true,
        score: { fullTime: { home: 3, away: 1 } },
        predicted_home_score: 2,
        predicted_away_score: 0,
      }),
    ];
    const result = computePredictionStats(rows);
    expect(result.hit).toBe(1);
    expect(result.bingo).toBe(0);
  });

  it('detects hit for draw prediction matching draw result', () => {
    const rows = [
      createRow({
        is_finished: true,
        score: { fullTime: { home: 2, away: 2 } },
        predicted_home_score: 1,
        predicted_away_score: 1,
      }),
    ];
    const result = computePredictionStats(rows);
    expect(result.hit).toBe(1);
  });

  it('detects miss (wrong outcome)', () => {
    const rows = [
      createRow({
        is_finished: true,
        score: { fullTime: { home: 0, away: 2 } },
        predicted_home_score: 2,
        predicted_away_score: 0,
      }),
    ];
    const result = computePredictionStats(rows);
    expect(result.miss).toBe(1);
  });

  it('calculates accuracy correctly', () => {
    const rows = [
      createRow({
        is_finished: true,
        score: { fullTime: { home: 2, away: 1 } },
        predicted_home_score: 2,
        predicted_away_score: 1,
      }), // bingo
      createRow({
        is_finished: true,
        score: { fullTime: { home: 3, away: 0 } },
        predicted_home_score: 1,
        predicted_away_score: 0,
      }), // hit
      createRow({
        is_finished: true,
        score: { fullTime: { home: 0, away: 1 } },
        predicted_home_score: 2,
        predicted_away_score: 0,
      }), // miss
    ];
    const result = computePredictionStats(rows);
    // accuracy = (bingo + hit) / finished = 2/3
    expect(result.accuracy).toBeCloseTo(2 / 3);
  });

  it('handles fulltime key variant', () => {
    const rows = [
      createRow({
        is_finished: true,
        score: { fulltime: { home: 1, away: 0 } },
        predicted_home_score: 1,
        predicted_away_score: 0,
      }),
    ];
    const result = computePredictionStats(rows);
    expect(result.bingo).toBe(1);
  });

  it('skips finished rows with null score values', () => {
    const rows = [
      createRow({
        is_finished: true,
        score: { fullTime: { home: null, away: null } },
        predicted_home_score: 1,
        predicted_away_score: 0,
      }),
    ];
    const result = computePredictionStats(rows);
    expect(result.finished).toBe(1);
    expect(result.bingo).toBe(0);
    expect(result.hit).toBe(0);
    expect(result.miss).toBe(0);
  });
});
