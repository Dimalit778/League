export interface TUser {
  id: any;
  name: string;
  avatar_url: string;
  email: string;
  subscription: boolean;
  primary_league_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface TLeague {
  id: string;
  name: string;
  owner_id: string;
  join_code: string;
  competition_id: number;
  max_members: number;
  created_at: Date;
  updated_at: Date;
}

export interface TLeagueMember {
  league_id: any;
  user_id: any;
  joined_at: Date;
}


export interface TCompetition {
  id: string;
  name: string;
  code: string;
  type: string;
  logo: string;
  country: string;
  flag: string;
  season: number;
  round: string;
  created_at: Date;
  updated_at: Date;
}
export interface TMatch {
  id: string;
  competition_id: string;
  home_team_id: string;
  away_team_id: string;
  matchday: number;
  utc_date: Date;
  status: string;
  stage: string;
  group_name: string;
  last_updated: Date;
  full_time_home_score: number;
  full_time_away_score: number;
  half_time_home_score: number;
  half_time_away_score: number;
  winner: string;
  duration: string;
  created_at: Date;
  updated_at: Date;
}

export interface TTeam {
  id: string;
  name: string;
  short_name: string;
  tla: string;
  crest_url: string;
  created_at: Date;
  updated_at: Date;
}
// export interface TPrediction {
//   id: string;
//   league_id: string;
//   user_id: string;
//   match_id: number;
//   home_score: number;
//   away_score: number;
//   points: number;
//   created_at: string;
//   match?: TMatch;
//   user?: TUser;
// }

// export interface TLeaderboardEntry {
//   league_id: string;
//   user_id: string;
//   display_name: string;
//   nickname: string;
//   total_points: number;
//   total_predictions: number;
//   exact_scores: number;
//   average_points: number;
//   position?: number;
// }
