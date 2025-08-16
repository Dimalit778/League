export interface LeaderboardData {
    members: Array<{
      nickname: string;
      avatar_url?: string;
      total_points: number;
      rank: number;
      is_creator: boolean;
    }>;
  }

  export type Member = {
    id: string;
    nickname: string;
    avatar_url?: string | null;
  };