import { Tables } from './database.types';

export type IconProps = {
  color?: string;
  size?: number;
};

// Member League Type
export type MemberLeague = Tables<'league_members'> & {
  league: Tables<'leagues'> & {
    league_members: { count: number }[];
  };
};
export type MemberLeagueArray = MemberLeague[];

export type LeagueLeaderboardType = {
  nickname: string | null;
  avatar_url?: string | null;
  total_points: number | null;
  predictions_count: number | null;
  user_id: string | null;
};

export type FixturesWithTeamsType = Tables<'fixtures'> & {
  home_team: Tables<'teams'>;
  away_team: Tables<'teams'>;
};
export type FixturesWithTeamsAndPredictionsType = FixturesWithTeamsType & {
  predictions: Tables<'predictions'>[] | null;
};

export type PredictionLeaderboardType = Tables<'predictions'> & {
  member: Tables<'league_members'>;
};

export type MemberStatsType = {
  totalPredictions: number;
  bingoHits: number;
  regularHits: number;
  missedHits: number;
  accuracy: number;
  totalPoints: number;
};
