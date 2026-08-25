import { getMatchStatus, isMatchFinished, isMatchLive, isMatchScheduled, statusLabel, statusLabelTone } from '../matchStatus';

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

  it('returns true for IN_PLAY', () => {
    expect(isMatchLive('IN_PLAY')).toBe(true);
  });

  it('returns false for FINISHED', () => {
    expect(isMatchLive('FINISHED')).toBe(false);
  });
});

describe('isMatchScheduled', () => {
  it('returns true for SCHEDULED', () => {
    expect(isMatchScheduled('SCHEDULED')).toBe(true);
  });

  it('returns true for TIMED', () => {
    expect(isMatchScheduled('TIMED')).toBe(true);
  });

  it('returns false for LIVE', () => {
    expect(isMatchScheduled('LIVE')).toBe(false);
  });
});

describe('statusLabel', () => {
  it('returns LIVE for in-play matches', () => {
    expect(statusLabel('IN_PLAY', 'Sat, 15/8')).toBe('LIVE');
  });

  it('returns FT for finished matches', () => {
    expect(statusLabel('FINISHED', 'Sat, 15/8')).toBe('FT');
  });

  it('returns the date for scheduled matches', () => {
    expect(statusLabel('TIMED', 'Sat, 15/8')).toBe('Sat, 15/8');
  });
});

describe('statusLabelTone', () => {
  it('returns success for live matches', () => {
    expect(statusLabelTone('LIVE')).toBe('success');
  });

  it('returns muted for finished matches', () => {
    expect(statusLabelTone('FINISHED')).toBe('muted');
  });

  it('returns default for scheduled matches', () => {
    expect(statusLabelTone('SCHEDULED')).toBe('default');
  });
});
