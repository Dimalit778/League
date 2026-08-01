import { formatMatchdayDate, formatTime } from '@/utils/formats';
import { MatchCardType, StatusType } from '../types';
import { isMatchFinished } from './matchStatus';

const PLACEHOLDER_LOGO = 'https://domain.com/placeholder-logo.png';

export type MatchCardTeam = {
  name: string;
  logo: string;
  score: number | null;
};

export type PredictionDisplayStatus = 'none' | 'correct' | 'incorrect';

export type MatchCardData = {
  id: number;
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
  match: MatchCardType,
  prediction: MatchCardType['prediction'],
): PredictionDisplayStatus {
  if (!prediction || prediction.home_score == null || prediction.away_score == null) {
    return 'none';
  }

  if (!isMatchFinished(match.status) || !prediction.is_finished) {
    return 'none';
  }

  return (prediction.points ?? 0) > 0 ? 'correct' : 'incorrect';
}

export function mapMatchToCardData(match: MatchCardType): MatchCardData {
  const prediction = match.prediction;

  return {
    id: match.id,

    home: {
      name: match.home_team?.shortName ?? '--',
      logo: match.home_team?.logo ?? PLACEHOLDER_LOGO,
      score: match.score?.fullTime?.home ?? null,
    },

    away: {
      name: match.away_team?.shortName ?? '--',
      logo: match.away_team?.logo ?? PLACEHOLDER_LOGO,
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
    date: formatMatchdayDate(match.kick_off),
    time: formatTime(match.kick_off),
  };
}
export const mapMatchToCardProps = mapMatchToCardData;
