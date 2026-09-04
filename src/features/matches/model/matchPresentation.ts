import type { MatchCardData, PredictionDisplayStatus } from '@/features/matches/utils/matchCard.mapper';
import type { StatusType } from '../types';
import { getMatchMinute } from '../utils/matchTimer';
import {
  FINISHED_STATUSES,
  PLAYING_STATUSES,
  SCHEDULED_STATUSES,
  UNAVAILABLE_STATUSES,
  statusLabel,
  statusLabelTone,
} from '../utils/matchStatus';

export type MatchPhase = 'scheduled' | 'live' | 'halftime' | 'finished' | 'unavailable';
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

export type MatchPredictionTone = 'success' | 'error' | 'info' | 'gold';

export type MatchUiPrediction =
  | { kind: 'value'; text: string; tone: MatchPredictionTone }
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
  cardStatusLabel: 'LIVE' | 'FT' | 'AWARDED' | null;
  status: MatchUiStatus;
  score: MatchUiScore;
  prediction: MatchUiPrediction;
  /** Points earned by the pick; non-null only on finished, scored matches. */
  predictionPoints: number | null;
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
  predictionPoints?: number | null;
};

function predictionTone(
  predictionStatus: PredictionDisplayStatus | undefined,
  predictionPoints: number | null | undefined,
): MatchPredictionTone {
  // Once scored, colour by the points earned so bingo (gold) reads apart from a hit (green).
  if (predictionPoints != null) {
    if (predictionPoints >= 5) return 'gold'; // gold
    if (predictionPoints > 0) return 'success'; // green
    return 'error'; // red
  }
  if (predictionStatus === 'correct') return 'success';
  if (predictionStatus === 'incorrect') return 'error';
  return 'info';
}

function resolvePrediction(
  prediction: MatchPresentationInput['prediction'],
  predictionStatus: PredictionDisplayStatus | undefined,
  predictionPoints: number | null | undefined,
  canPredict: boolean,
): MatchUiPrediction {
  const hasPrediction = prediction?.home != null && prediction.away != null;
  if (hasPrediction) {
    return {
      kind: 'value',
      text: `${prediction.home}-${prediction.away}`,
      tone: predictionTone(predictionStatus, predictionPoints),
    };
  }
  if (canPredict) return { kind: 'plus' };
  return { kind: 'empty' };
}

export function deriveMatchPresentation(
  { status, kickOff, secondHalfStartedAt, date = '', time = '', homeScore, awayScore, prediction, predictionStatus, predictionPoints }: MatchPresentationInput,
  now = new Date(),
): MatchPresentation {
  const normalizedStatus = status?.toUpperCase() ?? 'SCHEDULED';
  const kickoffTime = new Date(kickOff).getTime();
  const kickoffPassed = Number.isFinite(kickoffTime) && kickoffTime <= now.getTime();

  const phase: MatchPhase =
    FINISHED_STATUSES.has(normalizedStatus)
      ? 'finished'
      : normalizedStatus === 'PAUSED'
        ? 'halftime'
        : PLAYING_STATUSES.has(normalizedStatus)
          ? 'live'
          : UNAVAILABLE_STATUSES.has(normalizedStatus)
            ? 'unavailable'
            : 'scheduled';

  const canPredict = SCHEDULED_STATUSES.has(normalizedStatus) && !kickoffPassed;
  const isLive = phase === 'live' || phase === 'halftime';
  const isFinished = phase === 'finished';
  const minuteLabel =
    phase === 'live'
      ? getMatchMinute({ status: normalizedStatus, kickoffAt: kickOff, secondHalfStartedAt }, now)
      : '';
  const hasScore = homeScore != null && awayScore != null;
  const scoreMode: MatchScoreMode = canPredict
    ? 'versus'
    : phase === 'scheduled' || (phase === 'unavailable' && (normalizedStatus !== 'SUSPENDED' || !hasScore))
      ? 'kickoff-time'
      : 'score';

  return {
    phase,
    canPredict,
    isLive,
    isFinished,
    minuteLabel,
    detailStatusLabel:
      phase === 'finished'
        ? normalizedStatus === 'AWARDED'
          ? 'AWARDED'
          : 'FT'
        : phase === 'halftime'
          ? 'HT'
          : phase === 'live'
            ? `${minuteLabel} • LIVE`
            : phase === 'unavailable'
              ? normalizedStatus
              : null,
    cardStatusLabel: isFinished ? (normalizedStatus === 'AWARDED' ? 'AWARDED' : 'FT') : isLive ? 'LIVE' : null,
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
    prediction: resolvePrediction(prediction, predictionStatus, isFinished ? predictionPoints : null, canPredict),
    predictionPoints: isFinished ? (predictionPoints ?? null) : null,
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
      predictionPoints: match.predictionPoints,
    },
    now,
  );
}
