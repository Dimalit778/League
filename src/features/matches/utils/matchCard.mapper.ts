import { formatMatchdayDate, formatTime } from '@/utils/formats';
import { ImageSourcePropType } from 'react-native';
import { MatchWithPredictionsType } from '../types';

const PLACEHOLDER_LOGO = 'https://domain.com/placeholder-logo.png';

export type MatchCardTeam = {
  name: string;
  logo: ImageSourcePropType;
  score?: number | null;
};

export type MatchCardData = {
  id: string | number;
  home: MatchCardTeam;
  away: MatchCardTeam;
  prediction?: {
    home?: number | null;
    away?: number | null;
  } | null;
  date: string;
  time: string;
};

export function mapMatchToCardProps(match: MatchWithPredictionsType): MatchCardData {
  const prediction = match.predictions?.[0] ?? null;

  return {
    id: match.id,

    home: {
      name: match.home_team?.name ?? '--',
      logo: { uri: match.home_team?.logo ?? PLACEHOLDER_LOGO },
      score: match.score?.fullTime?.home ?? null,
    },

    away: {
      name: match.away_team?.name ?? '--',
      logo: { uri: match.away_team?.logo ?? PLACEHOLDER_LOGO },
      score: match.score?.fullTime?.away ?? null,
    },

    prediction: prediction
      ? {
          home: prediction.home_score ?? null,
          away: prediction.away_score ?? null,
        }
      : null,

    date: formatMatchdayDate(match.kick_off),
    time: formatTime(match.kick_off),
  };
}