/**
 * Returns 'SCHEDULED', 'LIVE', or 'FINISHED' based on the match status.
 * @param status Match status: SCHEDULED | TIMED | IN_PLAY | PAUSED | EXTRA_TIME | PENALTY_SHOOTOUT | FINISHED | SUSPENDED | POSTPONED | CANCELLED | AWARDED
 */
export function getSimpleMatchStatus(
  status: string | null | undefined
): 'SCHEDULED' | 'LIVE' | 'FINISHED' {
  if (!status) return 'SCHEDULED';
  const normalized = status.toUpperCase();
  if (normalized === 'SCHEDULED' || normalized === 'TIMED') {
    return 'SCHEDULED';
  }
  if (
    normalized === 'IN_PLAY' ||
    normalized === 'PAUSED' ||
    normalized === 'EXTRA_TIME' ||
    normalized === 'PENALTY_SHOOTOUT'
  ) {
    return 'LIVE';
  }
  if (normalized === 'FINISHED') {
    return 'FINISHED';
  }
  // treat suspended/postponed/cancelled/awarded as SCHEDULED fallback
  return 'SCHEDULED';
}

const getMatchStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'not started':
      return ['#6366F1', '#8B5CF6'];
    case 'first half':
    case 'second half':
    case 'halftime':
      return ['#EF4444', '#F97316'];
    case 'match finished':
      return ['#10B981', '#059669'];
    default:
      return ['#6B7280', '#9CA3AF'];
  }
};
