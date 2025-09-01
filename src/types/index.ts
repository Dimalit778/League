import { Tables } from './database.types';

export type IconProps = {
  color?: string;
  size?: number 
};
// League Types
export type createLeagueParams = {
  leagueName: string;
  nickname: string;
  user_id: string;
  competition_id: number;
  max_members: number;
};
export type createLeagueResponse = {
  status: string;
  message: string;
  league_id: string;
};

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
}



export type MyLeaguesType = Tables<'league_members'> & {
  leagues: Tables<'leagues'> & {
    competitions: Tables<'competitions'>;
  };
}

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