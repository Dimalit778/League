import { Tables } from "./database.types";

export type IconProps = {
  color?: string;
  size?: number 
};
export type LeagueLeaderboardType = {
  nickname: string | null;
  avatar_url?: string | null;
  total_points: number | null;
  predictions_count: number | null;
  user_id: string | null;
}


export type CreateLeagueParams = {
  name: string;
  nickname: string;
  logo: string;
  owner_id: string;
  competition_id: number;
  max_members: number;
};

export type LeagueWithCompetition = Tables<'leagues'> & {
  competitions: Tables<'competitions'>;
};
export type MyLeagueType = {
  is_primary: boolean;
  id: string;
  name: string;
  join_code: string;
  logo: string;
  max_members: number;
  league_members: number;
  competition_id : number;
  
}

export type FixturesWithTeams = Tables<'fixtures'> & {
  home_team: Tables<'teams'>;
  away_team: Tables<'teams'>;
};