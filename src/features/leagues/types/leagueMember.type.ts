export interface LeagueMember {
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
  export interface LeaguePageData {
    leagues: Array<{
      id: string;
      name: string;
      logo?: string;
      is_primary: boolean;
      is_creator: boolean;
      member_count: number;
      competition_name: string;
      competition_logo: string;
    }>;
  }