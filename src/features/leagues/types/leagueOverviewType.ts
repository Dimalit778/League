import { LeaderboardRow } from '@/features/leagues/types';
import { MatchCardType } from '@/features/matches/types';

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

export type LeagueOverviewData = {
  league: LeagueOverviewLeague;
  memberStats: LeagueOverviewMemberStats;
  leaderboard: LeaderboardRow[];
  todayMatches: MatchCardType[];
};
