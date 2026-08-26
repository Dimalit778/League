import { isHalfTimeStatus, isPlayingStatus, normalizeStatus } from './matchStatus';

type MatchClockInput = {
  status: string;
  kickoffAt: string;
  secondHalfStartedAt?: string | null;
};

const FIRST_HALF_MINUTES = 45;
const HALF_TIME_MINUTES = 15;
// Elapsed wall-clock minutes past this point are assumed to include the
// half-time break, so it is subtracted to keep the displayed clock realistic.
const SECOND_HALF_STARTS_AT = FIRST_HALF_MINUTES + HALF_TIME_MINUTES;
// Guard against a match left in a live status long after it really ended.
const MAX_DISPLAY_MINUTE = 130;

const minuteLabel = (minute: number) => `${Math.min(minute, MAX_DISPLAY_MINUTE)}'`;

export function getMatchMinute(
  { status, kickoffAt, secondHalfStartedAt }: MatchClockInput,
  now = new Date(),
) {
  const normalizedStatus = normalizeStatus(status);

  if (isHalfTimeStatus(normalizedStatus)) return 'HT';
  if (normalizedStatus === 'FINISHED') return 'FT';
  if (!isPlayingStatus(normalizedStatus)) return '';

  // Preferred, accurate path: the backend told us when the second half kicked
  // off, so we can count the second half exactly.
  if (secondHalfStartedAt) {
    const secondHalfStart = new Date(secondHalfStartedAt).getTime();
    if (Number.isNaN(secondHalfStart)) return '';

    const elapsedSecondHalf = Math.floor((now.getTime() - secondHalfStart) / 60_000);
    return minuteLabel(FIRST_HALF_MINUTES + Math.max(0, elapsedSecondHalf));
  }

  // Fallback: estimate from kick-off. Without a second-half timestamp we cannot
  // know the exact break, so approximate a standard 15' half-time once past it
  // rather than freezing the clock at 45'.
  const kickoff = new Date(kickoffAt).getTime();
  if (Number.isNaN(kickoff)) return '';

  const elapsed = Math.floor((now.getTime() - kickoff) / 60_000);

  if (elapsed <= FIRST_HALF_MINUTES) return minuteLabel(Math.max(1, elapsed));
  if (elapsed <= SECOND_HALF_STARTS_AT) return minuteLabel(FIRST_HALF_MINUTES);
  return minuteLabel(elapsed - HALF_TIME_MINUTES);
}
