import { getMatchStatus, getMatchStatusColor, isMatchFinished, isMatchLive, isMatchScheduled } from '../matchStatus';

describe('getMatchStatus', () => {
  it('returns SCHEDULED for null status', () => {
    expect(getMatchStatus(null)).toBe('SCHEDULED');
  });

  it('returns SCHEDULED for undefined status', () => {
    expect(getMatchStatus(undefined)).toBe('SCHEDULED');
  });

  it('returns SCHEDULED for SCHEDULED status', () => {
    expect(getMatchStatus('SCHEDULED')).toBe('SCHEDULED');
  });

  it('returns SCHEDULED for TIMED status', () => {
    expect(getMatchStatus('TIMED')).toBe('SCHEDULED');
  });

  it('returns LIVE for LIVE status', () => {
    expect(getMatchStatus('LIVE')).toBe('LIVE');
  });

  it('returns LIVE for IN_PLAY status', () => {
    expect(getMatchStatus('IN_PLAY')).toBe('LIVE');
  });

  it('returns LIVE for PAUSED status', () => {
    expect(getMatchStatus('PAUSED')).toBe('LIVE');
  });

  it('returns LIVE for EXTRA_TIME status', () => {
    expect(getMatchStatus('EXTRA_TIME')).toBe('LIVE');
  });

  it('returns LIVE for PENALTY_SHOOTOUT status', () => {
    expect(getMatchStatus('PENALTY_SHOOTOUT')).toBe('LIVE');
  });

  it('returns FINISHED for FINISHED status', () => {
    expect(getMatchStatus('FINISHED')).toBe('FINISHED');
  });

  it('handles lowercase input', () => {
    expect(getMatchStatus('finished')).toBe('FINISHED');
    expect(getMatchStatus('in_play')).toBe('LIVE');
  });

  it('returns SCHEDULED for unknown status', () => {
    expect(getMatchStatus('POSTPONED')).toBe('SCHEDULED');
  });
});

describe('isMatchFinished', () => {
  it('returns true for FINISHED', () => {
    expect(isMatchFinished('FINISHED')).toBe(true);
  });

  it('returns false for LIVE', () => {
    expect(isMatchFinished('LIVE')).toBe(false);
  });

  it('returns false for SCHEDULED', () => {
    expect(isMatchFinished('SCHEDULED')).toBe(false);
  });
});

describe('isMatchLive', () => {
  it('returns true for LIVE', () => {
    expect(isMatchLive('LIVE')).toBe(true);
  });

  it('returns false for FINISHED', () => {
    expect(isMatchLive('FINISHED')).toBe(false);
  });
});

describe('isMatchScheduled', () => {
  it('returns true for SCHEDULED', () => {
    expect(isMatchScheduled('SCHEDULED')).toBe(true);
  });

  it('returns false for LIVE', () => {
    expect(isMatchScheduled('LIVE')).toBe(false);
  });
});

describe('getMatchStatusColor', () => {
  const muted = '#888888';

  it('returns gold colors for 5 points (Bingo)', () => {
    const [primary, secondary] = getMatchStatusColor('FINISHED', true, 5, muted);
    expect(primary).toBe('#FCD34D');
    expect(secondary).toBe('#F59E0B');
  });

  it('returns green colors for 3 points (Hit)', () => {
    const [primary, secondary] = getMatchStatusColor('FINISHED', true, 3, muted);
    expect(primary).toBe('#10B981');
    expect(secondary).toBe('#059669');
  });

  it('returns gray/red colors for 0 points (Miss)', () => {
    const [primary, secondary] = getMatchStatusColor('FINISHED', true, 0, muted);
    expect(primary).toBe('#6B7280');
    expect(secondary).toBe('#EF4444');
  });

  it('returns muted colors when not finished', () => {
    const [primary, secondary] = getMatchStatusColor('SCHEDULED', false, 0, muted);
    expect(primary).toBe(muted);
    expect(secondary).toBe(muted);
  });

  it('returns muted colors for finished with unknown points', () => {
    const [primary, secondary] = getMatchStatusColor('FINISHED', true, 1, muted);
    expect(primary).toBe(muted);
    expect(secondary).toBe(muted);
  });
});
