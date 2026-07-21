import { MatchCardData } from '@/features/matches/utils/matchCard.mapper';
import { useMemberStats } from '@/features/memberStats/hooks/useMemberStats';

// Derive the stats shape from the query hook so this type stays correct
// regardless of what the member-stats type is named/shaped.
type MemberStatsData = ReturnType<typeof useMemberStats>['data'];

export type LeagueOverviewHeader = {
  nickname: string;
  avatarUrl: string | null;
  leagueName: string;
  logoUrl: string;
  flagUrl: string;
  rank: number;
  points: number;
  membersCount: number;
};

export type LeagueOverviewVM = {
  header: LeagueOverviewHeader;
  stats: MemberStatsData;
  upcomingMatches: MatchCardData[];
  isLoading: boolean;
};
