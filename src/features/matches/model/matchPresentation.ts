import type { StatusType } from '../types';
import { getMatchMinute } from '../utils/matchTimer';

export type MatchPhase = 'scheduled' | 'live' | 'halftime' | 'finished';
export type MatchScoreMode = 'versus' | 'kickoff-time' | 'score';

export type MatchPresentation = {
  phase: MatchPhase;
  scoreMode: MatchScoreMode;
  canPredict: boolean;
  isLive: boolean;
  isFinished: boolean;
  showKickoffTime: boolean;
  minuteLabel: string;
  detailStatusLabel: string | null;
  cardStatusLabel: 'LIVE' | 'FT' | null;
};

type MatchPresentationInput = {
  status: StatusType | string | null | undefined;
  kickOff: string;
  secondHalfStartedAt?: string | null;
};

const LIVE_STATUSES = new Set(['IN_PLAY', 'LIVE', 'EXTRA_TIME', 'PENALTY_SHOOTOUT']);

export function deriveMatchPresentation(
  { status, kickOff, secondHalfStartedAt }: MatchPresentationInput,
  now = new Date(),
): MatchPresentation {
  const normalizedStatus = status?.toUpperCase() ?? 'SCHEDULED';
  const kickoffTime = new Date(kickOff).getTime();
  const kickoffPassed = Number.isFinite(kickoffTime) && kickoffTime <= now.getTime();

  const phase: MatchPhase =
    normalizedStatus === 'FINISHED'
      ? 'finished'
      : normalizedStatus === 'PAUSED'
        ? 'halftime'
        : LIVE_STATUSES.has(normalizedStatus)
          ? 'live'
          : 'scheduled';

  const canPredict = phase === 'scheduled' && !kickoffPassed;
  const isLive = phase === 'live' || phase === 'halftime';
  const isFinished = phase === 'finished';
  const minuteLabel =
    phase === 'live'
      ? getMatchMinute({ status: normalizedStatus, kickoffAt: kickOff, secondHalfStartedAt }, now)
      : '';

  return {
    phase,
    canPredict,
    isLive,
    isFinished,
    showKickoffTime: !isFinished,
    minuteLabel,
    detailStatusLabel:
      phase === 'finished'
        ? 'FT'
        : phase === 'halftime'
          ? 'HT'
          : phase === 'live'
            ? `${minuteLabel} • LIVE`
            : null,
    cardStatusLabel: isFinished ? 'FT' : isLive ? 'LIVE' : null,
    scoreMode: canPredict ? 'versus' : phase === 'scheduled' ? 'kickoff-time' : 'score',
  };
}
