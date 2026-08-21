import {
  getMatchRefetchInterval,
  getMatchesRefetchInterval,
  LIVE_MATCH_REFETCH_INTERVAL,
  UPCOMING_MATCH_REFETCH_INTERVAL,
} from '../matchRefetch';

const NOW = new Date('2026-08-15T18:00:00.000Z').getTime();

const match = (status: 'TIMED' | 'SCHEDULED' | 'IN_PLAY' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'PAUSED', kickOff: string) => ({
  status,
  kick_off: kickOff,
});

describe('match refetch intervals', () => {
  it.each(['IN_PLAY', 'LIVE', 'PAUSED'] as const)('polls a %s match every 30 seconds', (status) => {
    expect(getMatchRefetchInterval(match(status, '2026-08-15T17:30:00.000Z'), NOW)).toBe(
      LIVE_MATCH_REFETCH_INTERVAL,
    );
  });

  it('polls a scheduled match that should already be active every 30 seconds', () => {
    expect(getMatchRefetchInterval(match('TIMED', '2026-08-15T17:30:00.000Z'), NOW)).toBe(
      LIVE_MATCH_REFETCH_INTERVAL,
    );
  });

  it('polls a match within 30 minutes of kick-off every minute', () => {
    expect(getMatchRefetchInterval(match('SCHEDULED', '2026-08-15T18:20:00.000Z'), NOW)).toBe(
      UPCOMING_MATCH_REFETCH_INTERVAL,
    );
  });

  it.each(['FINISHED', 'POSTPONED'] as const)('does not poll a %s match', (status) => {
    expect(getMatchRefetchInterval(match(status, '2026-08-15T17:30:00.000Z'), NOW)).toBe(false);
  });

  it('does not poll a scheduled match far from kick-off', () => {
    expect(getMatchRefetchInterval(match('SCHEDULED', '2026-08-16T18:00:00.000Z'), NOW)).toBe(false);
  });

  it('uses the fastest interval needed by a season list', () => {
    expect(
      getMatchesRefetchInterval(
        [
          match('SCHEDULED', '2026-08-15T18:20:00.000Z'),
          match('PAUSED', '2026-08-15T17:30:00.000Z'),
        ],
        NOW,
      ),
    ).toBe(LIVE_MATCH_REFETCH_INTERVAL);
  });
});
