type MatchClockInput = {
  status: string;
  kickoffAt: string;
  secondHalfStartedAt?: string | null;
};

export function getMatchMinute(
  { status, kickoffAt, secondHalfStartedAt }: MatchClockInput,
  now = new Date(),
) {
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus === 'PAUSED') return 'HT';
  if (normalizedStatus === 'FINISHED') return 'FT';

  const isLive = ['LIVE', 'IN_PLAY', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'].includes(normalizedStatus);
  if (!isLive) return '';

  if (secondHalfStartedAt) {
    const secondHalfStart = new Date(secondHalfStartedAt).getTime();
    if (Number.isNaN(secondHalfStart)) return '';

    const elapsedSecondHalf = Math.floor((now.getTime() - secondHalfStart) / 60_000);
    return `${45 + Math.max(0, elapsedSecondHalf)}'`;
  }

  const kickoff = new Date(kickoffAt).getTime();
  if (Number.isNaN(kickoff)) return '';

  const elapsed = Math.floor((now.getTime() - kickoff) / 60_000);
  return `${Math.max(1, Math.min(elapsed, 45))}'`;
}
