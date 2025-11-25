const getMatchStatus = (status: string | null | undefined): 'SCHEDULED' | 'LIVE' | 'FINISHED' => {
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

  return 'SCHEDULED';
};
// const getMatchStatusColorScOLE = (status: string) => {
//   switch (status?.toLowerCase()) {
//     case 'not started':
//       return ['#6366F1', '#8B5CF6'];
//     case 'first half':
//     case 'second half':
//     case 'halftime':
//       return ['#EF4444', '#F97316'];
//     case 'match finished':
//       return ['#10B981', '#059669'];
//     default:
//       return ['#6B7280', '#9CA3AF'];
//   }
// };
function getMatchStatusColor(
  status: string,
  isFinished: boolean,
  points: number,
  mutedColor: string
): [string, string] {
  if (status.toUpperCase() === 'FINISHED' && isFinished && points !== undefined) {
    if (points === 5) {
      return ['#FCD34D', '#F59E0B'];
    }
    if (points === 3) {
      return ['#10B981', '#059669'];
    }
    if (points === 0) {
      return ['#6B7280', '#EF4444'];
    }
    return [mutedColor, mutedColor];
  }

  return [mutedColor, mutedColor];
}
export { getMatchStatus, getMatchStatusColor };
