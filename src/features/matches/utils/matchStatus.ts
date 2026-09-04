/**
 * Single source of truth for football match status classification.
 *
 * Every other module (refetch cadence, presentation phase, live clock) must
 * derive "is this live / paused / in progress" from the sets below instead of
 * re-listing status strings — divergent copies were the cause of real bugs
 * (e.g. EXTRA_TIME matches silently dropping out of the live refetch window).
 */

export const normalizeStatus = (status: string | null | undefined): string =>
  status?.toUpperCase() ?? 'SCHEDULED';

/** The clock is running: first/second half, extra time, or a shootout. */
export const PLAYING_STATUSES = new Set(['IN_PLAY', 'LIVE', 'EXTRA_TIME', 'PENALTY_SHOOTOUT']);

/** The match has started and is not finished — playing or on the half-time break. */
export const IN_PROGRESS_STATUSES = new Set([...PLAYING_STATUSES, 'PAUSED']);

/** Official results that may settle predictions when a complete score exists. */
export const FINISHED_STATUSES = new Set(['FINISHED', 'AWARDED']);

/** The match will not produce further updates on its own. */
export const TERMINAL_STATUSES = new Set([...FINISHED_STATUSES, 'POSTPONED', 'CANCELLED']);

export const SCHEDULED_STATUSES = new Set(['SCHEDULED', 'TIMED']);
export const UNAVAILABLE_STATUSES = new Set(['SUSPENDED', 'POSTPONED', 'CANCELLED']);

/** Clock running (excludes the half-time PAUSED break). */
export const isPlayingStatus = (status: string | null | undefined): boolean =>
  PLAYING_STATUSES.has(normalizeStatus(status));

/** Started and not finished — playing or paused for half time. */
export const isInProgressStatus = (status: string | null | undefined): boolean =>
  IN_PROGRESS_STATUSES.has(normalizeStatus(status));

export const isHalfTimeStatus = (status: string | null | undefined): boolean =>
  normalizeStatus(status) === 'PAUSED';

const getMatchStatus = (
  status: string | null | undefined,
): 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'UNAVAILABLE' => {
  const normalized = normalizeStatus(status);
  if (FINISHED_STATUSES.has(normalized)) return 'FINISHED';
  if (IN_PROGRESS_STATUSES.has(normalized)) return 'LIVE';
  if (SCHEDULED_STATUSES.has(normalized)) return 'SCHEDULED';
  return 'UNAVAILABLE';
};

const isMatchFinished = (status: string | null | undefined): boolean => getMatchStatus(status) === 'FINISHED';
const isMatchLive = (status: string | null | undefined): boolean => getMatchStatus(status) === 'LIVE';
const isMatchScheduled = (status: string | null | undefined): boolean => getMatchStatus(status) === 'SCHEDULED';

function statusLabel(status: string | null | undefined, date: string) {
  const normalized = normalizeStatus(status);
  if (normalized === 'AWARDED') return 'AWARDED';
  if (UNAVAILABLE_STATUSES.has(normalized)) return normalized;
  if (isMatchLive(status)) return 'LIVE';
  if (isMatchFinished(status)) return 'FT';
  return date;
}

function statusLabelTone(status: string | null | undefined): 'success' | 'muted' | 'default' {
  if (isMatchLive(status)) return 'success';
  if (isMatchFinished(status)) return 'muted';
  return 'default';
}

export { getMatchStatus, isMatchFinished, isMatchLive, isMatchScheduled, statusLabel, statusLabelTone };
