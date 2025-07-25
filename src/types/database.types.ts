import { FootballLeague } from "./index";

export interface User {
  id: string;
  email: string;
  display_name: string;
  subscription_tier: "free" | "premium";
  created_at: string;
}

export interface League {
  id: string;
  name: string;
  selected_league: FootballLeague;
  admin_id: string;
  invite_code: string;
  max_members: number;
  created_at: string;
  admin?: User;
}

export interface LeagueMember {
  league_id: string;
  user_id: string;
  nickname: string;
  joined_at: string;
  user?: User;
  league?: League;
}

export interface Match {
  id: number;
  home_team: string;
  away_team: string;
  league: FootballLeague;
  kickoff: string;
  status: "scheduled" | "live" | "finished";
  home_score?: number;
  away_score?: number;
  updated_at: string;
}

export interface Prediction {
  id: string;
  league_id: string;
  user_id: string;
  match_id: number;
  home_score: number;
  away_score: number;
  points: number;
  created_at: string;
  match?: Match;
  user?: User;
}

export interface LeaderboardEntry {
  league_id: string;
  user_id: string;
  display_name: string;
  nickname: string;
  total_points: number;
  total_predictions: number;
  exact_scores: number;
  average_points: number;
  position?: number;
}
