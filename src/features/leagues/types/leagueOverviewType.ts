export type LeagueOverviewLeague = {
    id: string;
    name: string;
    competitionId: number;
    competitionName: string;
    logoUrl: string | null;
    flagUrl: string | null;
    isPrimary: boolean;
  };
  
  export type LeagueOverviewMemberStats = {
    memberId: string;
    nickname: string;
    avatarUrl: string | null;
    rank: number;
    points: number;
    pendingPredictions: number;
  };
  
  export type OverviewTeam = {
    id: number;
    name: string;
    shortName?: string | null;
    logoUrl?: string | null;
    flagUrl?: string | null;
  };
  
  export type OverviewMatch = {
    id: number;
    kickOff: string;
    dateLabel: string;
    timeLabel: string;
    homeTeam: OverviewTeam;
    awayTeam: OverviewTeam;
    hasPrediction?: boolean;
  };
  
  export type LeaderboardRow = {
    member_id: string;
    nickname: string;
    avatar_url: string | null;
    rank: number;
    total_points: number;
    correct_scores?: number;
  };

  export type LeagueOverviewData = {
    league: LeagueOverviewLeague;
    memberStats: LeagueOverviewMemberStats;
    nextPrediction: OverviewMatch | null;
    leaderboard: LeaderboardRow[];
    upcomingMatches: OverviewMatch[];
  };