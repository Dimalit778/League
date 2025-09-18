import { Tables } from './database.types';
// App Types
export type IconProps = {
  color?: string;
  size?: number;
};
// Database Types
// Member And League Type
export type MemberLeague = Tables<'league_members'> & {
  league: Tables<'leagues'>;
};
export type FoundLeague = Tables<'leagues'> & {
  competition: Pick<
    Tables<'competitions'>,
    'id' | 'name' | 'logo' | 'flag' | 'country'
  >;
  league_members: { count: number }[];
};
export type leagueWithMembers = Tables<'leagues'> & {
  league_members: Tables<'league_members'>[];
  competition: Pick<
    Tables<'competitions'>,
    'id' | 'name' | 'logo' | 'country' | 'flag'
  >;
  owner: Tables<'league_members'>;
};
export type createLeagueProps = {
  league_name: string;
  nickname: string;
  competition_id: number;
  max_members: number;
  user_id: string;
  league_logo: string;
};

export type createLeagueResponse = {
  league_id: string;
  league_name: string;
  message: string;
  success: boolean;
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
