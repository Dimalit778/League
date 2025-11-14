import { Tables } from './database.types';
// App Types
export type IconProps = {
  color?: string;
  size?: number;
};
export type ScoreType = {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
  duration: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT' | null;
  fullTime?: { home: number | null; away: number | null };
  halfTime?: { home: number | null; away: number | null };
};

export type MemberLeagueType = Tables<'league_members'> & {
  league: Tables<'leagues'> & {
    competition: Tables<'competitions'>;
  };
};
export type LeagueWithCompetitionType = Tables<'leagues'> & {
  competition: Tables<'competitions'>;
};
export type LeagueWithCompetitionAndMembersCountType = Tables<'leagues'> & {
  competition: Tables<'competitions'>;
  league_members: { count: number }[];
};

export type LeagueWithMembersType = Tables<'leagues'> & {
  league_members: Tables<'league_members'>[];
  competition: Pick<Tables<'competitions'>, 'id' | 'name' | 'logo' | 'area' | 'flag'>;
};

export type MatchType = Tables<'matches'> & {
  home_team: Tables<'teams'>;
  away_team: Tables<'teams'>;
  score: ScoreType;
};
export type MatchWithPredictionsType = Tables<'matches'> & {
  home_team: Tables<'teams'>;
  away_team: Tables<'teams'>;
  score: ScoreType;
  predictions: PredictionType[];
};
export type PredictionType = Tables<'predictions'>;

export type LeaderboardAndMemberType = Tables<'predictions'> & {
  member: Tables<'league_members'>;
};

export type MemberPredictionType = Tables<'predictions'> & {
  member: Tables<'league_members'>;
};
export type StatsType = {
  totalPredictions: number;
  bingoHits: number;
  regularHits: number;
  missedHits: number;
  accuracy: number;
  totalPoints: number;
  position?: number | null;
};
