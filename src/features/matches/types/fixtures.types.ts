export interface Fixture {
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
  export interface MatchesPageData {
    rounds: Array<{
      round: string;
      can_predict: boolean;
      finished_matches: number;
      total_matches: number;
    }>;
    fixtures: Array<{
      id: number;
      home_team_name: string;
      home_team_logo: string;
      away_team_name: string;
      away_team_logo: string;
      match_date: string;
      status_short: string;
      home_goals?: number;
      away_goals?: number;
      home_goals_prediction?: number;
      away_goals_prediction?: number;
      points_earned?: number;
      can_predict: boolean;
    }>;
  }
  export interface MatchDetailsData {
    match: {
      id: number;
      home_team_name: string;
      home_team_logo: string;
      away_team_name: string;
      away_team_logo: string;
      match_date: string;
      status_short: string;
      home_goals?: number;
      away_goals?: number;
      can_predict: boolean;
    };
    predictions: Array<{
      nickname: string;
      avatar_url?: string;
      home_goals_prediction: number;
      away_goals_prediction: number;
      points_earned: number;
    }>;
  }