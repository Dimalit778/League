import { Tables } from './database.types';

export type IconProps = {
  color?: string;
  size?: number;
};
// League Types
export type createLeagueParams = {
  leagueName: string;
  nickname: string;
  user_id: string;
  competition_id: number;
  max_members: number;
  league_logo: string;
};
export type createLeagueResponse = {
  status: string;
  message: string;
  league_id: string;
};

// Join League Response Type
export type joinLeagueResponse = {
  league_id: string;
  league_name: string;
  message: string;
  success: boolean;
}[];
// Member League Type
export type MemberLeague = Tables<'league_members'> & {
  league: Tables<'leagues'> & {
    league_members: { count: number }[];
  };
};
export type MemberLeagueArray = MemberLeague[];

// Leave League Response Type
export type leaveLeagueResponse = any; // Returns Json from database

export type foundLeagueType = {
  id: string;
  name: string;
  join_code: string;
  max_members: number;
  league_members: number;
  competition_id: number;
  logo: string;
  country: string;
  flag: string;
  owner_id: string;
};
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
