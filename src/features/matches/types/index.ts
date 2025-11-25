import { Tables } from '@/types/database.types';
export type ScoreType = {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
  duration: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT' | null;
  fullTime?: { home: number | null; away: number | null };
  halfTime?: { home: number | null; away: number | null };
};

export type TeamType = Tables<'teams'>;
export type PredictionType = Tables<'predictions'>;

export type MatchType = Tables<'matches'> & {
  home_team: TeamType;
  away_team: TeamType;
  score: ScoreType;
};
export type MatchWithPredictionsType = MatchType & {
  predictions: Tables<'predictions'>[];
};

export type MatchWithPredictionsAndMemberType = MatchType & {
  predictions?: (PredictionType & {
    league_member: Tables<'league_members'>;
  })[];
};

export type PredictionsMemberType = Tables<'predictions'> & {
  league_member: Tables<'league_members'>;
};
