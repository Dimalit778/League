import { LeaderboardRow } from '@/features/leagues/types';
import { MatchCardData } from '@/features/matches/utils/matchCard.mapper';

export type LeagueOverviewLeague = {
  id: string;
  name: string;
  competitionId: number;
  competitionName: string;
  logoUrl: string;
  flagUrl: string;
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

export type LeagueOverviewData = {
  league: LeagueOverviewLeague;
  memberStats: LeagueOverviewMemberStats;
  leaderboard: LeaderboardRow[];
  todayMatches: MatchCardData[];
};
