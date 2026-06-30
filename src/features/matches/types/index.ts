import { Tables } from '@/types/database.types';


export type TeamType = Pick<
  Tables<'teams'>,
  'id' | 'shortName' | 'name' | 'logo' | 'tla' | 'venue'
>;

export type PredictionsType = Pick<
  Tables<'predictions'>,
  'id' | 'match_id' | 'league_member_id' | 'home_score' | 'away_score' | 'points' | 'is_finished'
>;
export type StatusType = Tables<'matches'>['status'];
export type ScoreType = {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
  duration: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT' | null;
  fullTime?: { home: number | null; away: number | null };
  halfTime?: { home: number | null; away: number | null };
};

export type MatchBaseType = Pick<
  Tables<'matches'>,
  | 'id'
  | 'competition_id'
  | 'fixture'
  | 'kick_off'
  | 'stage'
  | 'group'
  | 'home_team_id'
  | 'away_team_id'
  | 'ai_summary_en'
  | 'ai_summary_he'
  | 'ai_predicted_home_score'
  | 'ai_predicted_away_score'
> & {
  status: StatusType;
  score: ScoreType | null;
  home_team: TeamType | null;
  away_team: TeamType | null;
};

export type MatchCardType = MatchBaseType & {
  prediction: PredictionsType | null;
};

export type MatchCardRawType = MatchBaseType & {
  predictions: PredictionsType[] | null;
};

export type PredictionWithMemberType = PredictionsType & {
  league_member: Pick<
    Tables<'league_members'>,
    'id' | 'league_id' | 'user_id' | 'nickname' | 'avatar_url' | 'is_primary'
  > | null;
};

export type MatchWithAllPredictionsType = MatchBaseType & {
  predictions: PredictionWithMemberType[];
};

/** List/tournament match with the current member's single prediction. */
export type MatchWithPredictionsType = MatchCardType;

/** Match detail with all league member predictions. */
export type MatchWithPredictions = MatchWithAllPredictionsType;

/** @deprecated Alias for PredictionWithMemberType */
export type PredictionMemberType = PredictionWithMemberType;

export * from './footballStages';