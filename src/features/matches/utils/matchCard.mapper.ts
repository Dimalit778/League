import { formatMatchdayDate, formatTime } from '@/utils/formats';
import { MatchListItem, StatusType } from '../types';
import { isMatchFinished } from './matchStatus';

export type MatchCardTeam = {
  name: string;
  tla: string;
  /** Raw football-data value, e.g. "Red / White" — parsed by TeamLogo. */
  clubColors: string | null;
  score: number | null;
};

export type PredictionDisplayStatus = 'none' | 'correct' | 'incorrect';

export type MatchCardData = {
  id: number;
  kickOff: string;
  status: StatusType;
  home: MatchCardTeam;
  away: MatchCardTeam;
  prediction: {
    home: number | null;
    away: number | null;
  } | null;
  predictionStatus: PredictionDisplayStatus;
  date: string;
  time: string;
};

function getPredictionDisplayStatus(
  match: MatchListItem,
  prediction: MatchListItem['prediction'],
): PredictionDisplayStatus {
  if (!prediction || prediction.home_score == null || prediction.away_score == null) {
    return 'none';
  }

  if (!isMatchFinished(match.status) || !prediction.is_finished) {
    return 'none';
  }

  return (prediction.points ?? 0) > 0 ? 'correct' : 'incorrect';
}

export function mapMatchToCardData(match: MatchListItem, locale: string = 'en-GB'): MatchCardData {
  const prediction = match.prediction;

  return {
    id: match.id,
    kickOff: match.kick_off,

    home: {
      name: match.home_team?.shortName ?? '--',
      tla: match.home_team?.tla ?? '--',
      clubColors: match.home_team?.clubColors ?? null,
      score: match.score?.fullTime?.home ?? null,
    },

    away: {
      name: match.away_team?.shortName ?? '--',
      tla: match.away_team?.tla ?? '--',
      clubColors: match.away_team?.clubColors ?? null,
      score: match.score?.fullTime?.away ?? null,
    },

    prediction: prediction
      ? {
          home: prediction.home_score ?? null,
          away: prediction.away_score ?? null,
        }
      : null,

    predictionStatus: getPredictionDisplayStatus(match, prediction),
    status: match.status,
    date: formatMatchdayDate(match.kick_off, locale),
    time: formatTime(match.kick_off),
  };
}
