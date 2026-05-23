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

/** Tournament fetch: first phase (groups or league phase) vs knockout stages. */
export type TournamentMatchesSplit = {
  firstPhase: MatchWithPredictionsType[];
  knockoutStages: MatchWithPredictionsType[];
};

export type MatchWithPredictions = MatchType & {
  predictions?: (PredictionType & {
    league_member: Tables<'league_members'>;
  })[];
};

export type PredictionMemberType = Tables<'predictions'> & {
  league_member: Tables<'league_members'>;
};

export type GroupStandingType = Tables<'competition_group_standings'> & {
  team: TeamType;
};

export type MatchStatusType = 'SCHEDULED' | 'LIVE' | 'FINISHED';
export type TournamentMatchType = MatchType & {
  predictions: PredictionMemberType[];
};

export * from './footballStages';
