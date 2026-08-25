import type { MatchCardData, PredictionDisplayStatus } from '@/features/matches/utils/matchCard.mapper';
import type { StatusType } from '../types';
import { getMatchMinute } from '../utils/matchTimer';
import { PLAYING_STATUSES, statusLabel, statusLabelTone } from '../utils/matchStatus';

export type MatchPhase = 'scheduled' | 'live' | 'halftime' | 'finished';
export type MatchScoreMode = 'versus' | 'kickoff-time' | 'score';
export type MatchUiTone = 'success' | 'muted' | 'default' | 'error' | 'info';

export type MatchUiStatus = {
  label: string;
  tone: 'success' | 'muted' | 'default';
};

export type MatchUiScore =
  | {
      kind: 'score';
      home: number;
      away: number;
      tone: 'success' | 'muted';
    }
  | {
      kind: 'time';
      time: string;
    }
  | { kind: 'empty' };

export type MatchUiPrediction =
  | { kind: 'value'; text: string; tone: 'success' | 'error' | 'info' }
  | { kind: 'plus' }
  | { kind: 'empty' };

export type MatchPresentation = {
  phase: MatchPhase;
  scoreMode: MatchScoreMode;
  canPredict: boolean;
  isLive: boolean;
  isFinished: boolean;
  minuteLabel: string;
  detailStatusLabel: string | null;
  cardStatusLabel: 'LIVE' | 'FT' | null;
  status: MatchUiStatus;
  score: MatchUiScore;
  prediction: MatchUiPrediction;
};

type MatchPresentationInput = {
  status: StatusType | string | null | undefined;
  kickOff: string;
  secondHalfStartedAt?: string | null;
  date?: string;
  time?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  prediction?: { home: number | null; away: number | null } | null;
  predictionStatus?: PredictionDisplayStatus;
};

function predictionTone(predictionStatus: PredictionDisplayStatus | undefined): 'success' | 'error' | 'info' {
  if (predictionStatus === 'correct') return 'success';
  if (predictionStatus === 'incorrect') return 'error';
  return 'info';
}

function resolvePrediction(
  prediction: MatchPresentationInput['prediction'],
  predictionStatus: PredictionDisplayStatus | undefined,
  canPredict: boolean,
): MatchUiPrediction {
  const hasPrediction = prediction?.home != null && prediction.away != null;
  if (hasPrediction) {
    return {
      kind: 'value',
      text: `${prediction.home}-${prediction.away}`,
      tone: predictionTone(predictionStatus),
    };
  }
  if (canPredict) return { kind: 'plus' };
  return { kind: 'empty' };
}

export function deriveMatchPresentation(
  { status, kickOff, secondHalfStartedAt, date = '', time = '', homeScore, awayScore, prediction, predictionStatus }: MatchPresentationInput,
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
        : PLAYING_STATUSES.has(normalizedStatus)
          ? 'live'
          : 'scheduled';

  const canPredict = phase === 'scheduled' && !kickoffPassed;
  const isLive = phase === 'live' || phase === 'halftime';
  const isFinished = phase === 'finished';
  const minuteLabel =
    phase === 'live'
      ? getMatchMinute({ status: normalizedStatus, kickoffAt: kickOff, secondHalfStartedAt }, now)
      : '';
  const scoreMode: MatchScoreMode = canPredict ? 'versus' : phase === 'scheduled' ? 'kickoff-time' : 'score';
  const hasScore = homeScore != null && awayScore != null;

  return {
    phase,
    canPredict,
    isLive,
    isFinished,
    minuteLabel,
    detailStatusLabel:
      phase === 'finished' ? 'FT' : phase === 'halftime' ? 'HT' : phase === 'live' ? `${minuteLabel} • LIVE` : null,
    cardStatusLabel: isFinished ? 'FT' : isLive ? 'LIVE' : null,
    scoreMode,
    status: {
      label: statusLabel(status, date),
      tone: statusLabelTone(status),
    },
    score:
      scoreMode !== 'score'
        ? { kind: 'time', time }
        : hasScore
          ? {
              kind: 'score',
              home: homeScore,
              away: awayScore,
              tone: isLive ? 'success' : 'muted',
            }
          : { kind: 'empty' },
    prediction: resolvePrediction(prediction, predictionStatus, canPredict),
  };
}

export function deriveCardPresentation(match: MatchCardData, now = new Date()) {
  return deriveMatchPresentation(
    {
      status: match.status,
      kickOff: match.kickOff,
      date: match.date,
      time: match.time,
      homeScore: match.home.score,
      awayScore: match.away.score,
      prediction: match.prediction,
      predictionStatus: match.predictionStatus,
    },
    now,
  );
}
