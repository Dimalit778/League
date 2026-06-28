import { formatMatchdayDate, formatTime } from '@/utils/formats';
import { MatchWithPredictionsType } from '../types';

const PLACEHOLDER_LOGO = 'https://domain.com/placeholder-logo.png';

export type MatchCardTeam = {
  name: string;
  logo: string;
  score?: number | null;
};

export type PredictionDisplayStatus = 'none' | 'pending' | 'correct' | 'incorrect';

export type MatchCardData = {
  id: string | number;
  home: MatchCardTeam;
  away: MatchCardTeam;
  prediction?: {
    home?: number | null;
    away?: number | null;
  } | null;
  predictionStatus: PredictionDisplayStatus;
  date: string;
  time: string;
};

function getPredictionDisplayStatus(
  match: MatchWithPredictionsType,
  prediction: MatchWithPredictionsType['predictions'][number] | null,
): PredictionDisplayStatus {
  if (!prediction || prediction.home_score == null || prediction.away_score == null) {
    return 'none';
  }

  if (match.status !== 'FINISHED' || !prediction.is_finished) {
    return 'pending';
  }

  return prediction.points > 0 ? 'correct' : 'incorrect';
}

export function mapMatchToCardProps(match: MatchWithPredictionsType): MatchCardData {
  const prediction = match.predictions?.[0] ?? null;

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

    date: formatMatchdayDate(match.kick_off),
    time: formatTime(match.kick_off),
  };
}
