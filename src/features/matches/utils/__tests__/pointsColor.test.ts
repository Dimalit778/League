import { POINTS_COLOR, getPointsColorKey, getPredictionResultLabel } from '../pointsColor';

describe('POINTS_COLOR', () => {
  it('has the expected color values', () => {
    expect(POINTS_COLOR.Bingo).toBe('#FCD34D');
    expect(POINTS_COLOR.Hit).toBe('#10B981');
    expect(POINTS_COLOR.Miss).toBe('#EF4444');
  });
});

describe('getPointsColorKey', () => {
  it('returns Bingo for 5 points', () => {
    expect(getPointsColorKey(5)).toBe('Bingo');
  });

  it('returns Hit for 3 points', () => {
    expect(getPointsColorKey(3)).toBe('Hit');
  });

  it('returns Miss for 0 points', () => {
    expect(getPointsColorKey(0)).toBe('Miss');
  });

  it('returns Miss for null', () => {
    expect(getPointsColorKey(null)).toBe('Miss');
  });

  it('returns Miss for undefined', () => {
    expect(getPointsColorKey(undefined)).toBe('Miss');
  });

  it('returns Miss for unrecognized points', () => {
    expect(getPointsColorKey(1)).toBe('Miss');
  });
});

describe('getPredictionResultLabel', () => {
  it('returns Bingo label for 5 points when finished', () => {
    const result = getPredictionResultLabel(5, true, true);
    expect(result).toEqual({ title: 'Bingo', color: '#FCD34D' });
  });

  it('returns Hit label for 3 points when finished', () => {
    const result = getPredictionResultLabel(3, true, true);
    expect(result).toEqual({ title: 'Hit', color: '#10B981' });
  });

  it('returns Miss label for 0 points when finished', () => {
    const result = getPredictionResultLabel(0, true, true);
    expect(result).toEqual({ title: 'Miss', color: '#EF4444' });
  });

  it('returns null when match is not finished', () => {
    expect(getPredictionResultLabel(5, true, false)).toBeNull();
  });

  it('returns null when prediction is not finished', () => {
    expect(getPredictionResultLabel(5, false, true)).toBeNull();
  });

  it('returns null when neither is finished', () => {
    expect(getPredictionResultLabel(5, false, false)).toBeNull();
  });
});
