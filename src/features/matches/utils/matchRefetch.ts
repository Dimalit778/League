import { MatchBaseType } from '../types';

export const LIVE_MATCH_REFETCH_INTERVAL = 30_000;
export const UPCOMING_MATCH_REFETCH_INTERVAL = 60_000;

const UPCOMING_WINDOW_MS = 30 * 60 * 1000;
const ACTIVE_MATCH_WINDOW_MS = 4 * 60 * 60 * 1000;
const LIVE_STATUSES = new Set(['IN_PLAY', 'LIVE', 'PAUSED']);
const TERMINAL_STATUSES = new Set(['FINISHED', 'POSTPONED']);

type RefreshableMatch = Pick<MatchBaseType, 'kick_off' | 'status'>;

export const getMatchRefetchInterval = (
  match: RefreshableMatch | null | undefined,
  now = Date.now(),
): number | false => {
  if (!match) return false;

  const status = match.status?.toUpperCase();
  if (status && LIVE_STATUSES.has(status)) return LIVE_MATCH_REFETCH_INTERVAL;
  if (status && TERMINAL_STATUSES.has(status)) return false;

  const kickOff = new Date(match.kick_off).getTime();
  if (!Number.isFinite(kickOff)) return false;

  const timeUntilKickOff = kickOff - now;
  if (timeUntilKickOff <= 0 && timeUntilKickOff >= -ACTIVE_MATCH_WINDOW_MS) {
    return LIVE_MATCH_REFETCH_INTERVAL;
  }

  if (timeUntilKickOff > 0 && timeUntilKickOff <= UPCOMING_WINDOW_MS) {
    return UPCOMING_MATCH_REFETCH_INTERVAL;
  }

  return false;
};

export const getMatchesRefetchInterval = (
  matches: RefreshableMatch[] | null | undefined,
  now = Date.now(),
): number | false => {
  if (!matches?.length) return false;

  let interval: number | false = false;
  for (const match of matches) {
    const matchInterval = getMatchRefetchInterval(match, now);
    if (matchInterval === LIVE_MATCH_REFETCH_INTERVAL) return LIVE_MATCH_REFETCH_INTERVAL;
    if (matchInterval !== false) interval = UPCOMING_MATCH_REFETCH_INTERVAL;
  }

  return interval;
};
