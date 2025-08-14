export interface GUser {
    id: string;
    email: string;
    created_at: string;
  }
  
  export interface GCompetition {
    id: number;
    name: string;
    type: string;
    logo?: string;
    country_name?: string;
    country_code?: string;
    country_flag?: string;
    current_season: number;
    season_start?: string;
    season_end?: string;
  }
  
  export interface GTeam {
    id: number;
    name: string;
    logo?: string;
  }
  
  export interface GFixture {
    id: number;
    competition_id: number;
    season: number;
    round: string;
    match_date: string;
    status_long: string;
    status_short: string;
    elapsed_time?: number;
    venue_name?: string;
    venue_city?: string;
    referee?: string;
    home_team_id: number;
    away_team_id: number;
    home_goals?: number;
    away_goals?: number;
    home_goals_halftime?: number;
    away_goals_halftime?: number;
    winner?: 'home' | 'away' | 'draw';
    // Joined data
    home_team_name?: string;
    home_team_logo?: string;
    away_team_name?: string;
    away_team_logo?: string;
    // User prediction data
    home_goals_prediction?: number;
    away_goals_prediction?: number;
    points_earned?: number;
    can_predict?: boolean;
  }
  
  export interface GLeague {
    id: string;
    name: string;
    logo?: string;
    join_code: string;
    competition_id: number;
    season: number;
    created_by?: string;
    max_members: number;
    created_at: string;
    // Joined data
    nickname?: string;
    is_primary?: boolean;
    is_creator?: boolean;
    member_count?: number;
    competition_name?: string;
    competition_logo?: string;
  }
  
  export interface GLeagueMember {
    id: string;
    user_id: string;
    league_id: string;
    nickname: string;
    avatar_url?: string;
    is_primary: boolean;
    is_creator: boolean;
    total_points: number;
    joined_at: string;
    rank?: number;
  }
  
  export interface Prediction {
    id: string;
    user_id: string;
    league_id: string;
    fixture_id: number;
    home_goals_prediction: number;
    away_goals_prediction: number;
    points_earned: number;
    predicted_at: string;
  }
  
  export interface RoundInfo {
    round: string;
    round_start_time: string;
    can_predict: boolean;
    finished_matches: number;
    total_matches: number;
  }
  
  export interface MatchDetails extends GFixture {
    predictions: Array<{
      nickname: string;
      avatar_url?: string;
      home_goals_prediction: number;
      away_goals_prediction: number;
      points_earned: number;
    }>;
  }