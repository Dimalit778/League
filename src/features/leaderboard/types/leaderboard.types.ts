export interface LeaderboardData {
    members: Array<{
      nickname: string;
      avatar_url?: string;
      total_points: number;
      rank: number;
      is_creator: boolean;
    }>;
  }