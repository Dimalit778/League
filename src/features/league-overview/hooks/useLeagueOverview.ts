import { useGetLeaderboard } from '@/features/leagues/hooks/useLeagues';
import { LeagueOverviewData } from '@/features/leagues/types/leagueOverviewType';
import { useGetTodayMatches } from '@/features/matches/hooks/useMatches';
import { useMemberStats } from '@/features/memberStats/hooks/useMemberStats';
import { usePrimaryMember } from '@/store/MemberStore';

export function useLeagueOverview(): LeagueOverviewData {
  const primaryMember = usePrimaryMember();

  const { data: leaderboardData } = useGetLeaderboard(primaryMember.leagueId);
  const { data: memberStats } = useMemberStats(primaryMember.memberId);
  const { data: todayMatches } = useGetTodayMatches({
    competitionId: primaryMember.competitionId,
    memberId: primaryMember.memberId,
  });

  return {
    league: {
      id: primaryMember.leagueId,
      name: primaryMember.leagueName,
      competitionId: primaryMember.competitionId,
      competitionName: primaryMember.competitionName,
      logoUrl: primaryMember.competitionLogo,
      flagUrl: primaryMember.competitionFlag,
      isPrimary: primaryMember.isPrimary,
    },

    memberStats: {
      memberId: primaryMember.memberId,
      nickname: primaryMember.nickname,
      avatarUrl: primaryMember.avatarUrl,
      rank: memberStats?.position ?? 0,
      points: memberStats?.totalPoints ?? 0,
      pendingPredictions: memberStats?.pendingPredictions ?? 0,
    },
    leaderboard: leaderboardData ?? [],
    todayMatches: todayMatches ?? [],
  };
}
