import { MatchStatusType } from '../types';

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
const isMatchFinished = (status: MatchStatusType): boolean => status === 'FINISHED';
const isMatchLive = (status: MatchStatusType): boolean => status === 'LIVE';
const isMatchScheduled = (status: MatchStatusType): boolean => status === 'SCHEDULED';
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
export { getMatchStatus, getMatchStatusColor, isMatchFinished, isMatchLive, isMatchScheduled };
