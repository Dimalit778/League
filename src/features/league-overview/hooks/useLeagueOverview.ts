import { useGetLeagueAndMembers } from '@/features/leagues/hooks/useLeagues';
import { LeagueOverviewVM } from '@/features/leagues/types/leagueOverviewType';
import { useGetTodayMatches } from '@/features/matches/hooks/useMatches';
import { mapMatchToCardData } from '@/features/matches/utils/matchCard.mapper';
import { useMemberStats } from '@/features/memberStats/hooks/useMemberStats';
import { usePrimaryMember } from '@/store/MemberStore';

export function useLeagueOverview(): LeagueOverviewVM {
  const { memberId, leagueId, competitionId, nickname, avatarUrl } = usePrimaryMember();

  const { data: league, isLoading: leagueLoading } = useGetLeagueAndMembers(leagueId);
  const { data: stats, isLoading: statsLoading } = useMemberStats(memberId);
  const { data: todayMatches, isLoading: matchesLoading } = useGetTodayMatches({
    competitionId,
    memberId,
  });

  return {
    header: {
      nickname: nickname ?? '',
      avatarUrl: avatarUrl ?? null,
      leagueName: league?.name ?? '',
      logoUrl: league?.competition?.logo ?? '',
      flagUrl: league?.competition?.flag ?? '',
      rank: stats?.position ?? 0,
      points: stats?.totalPoints ?? 0,
      membersCount: league?.league_members?.length ?? 0,
    },
    stats,
    upcomingMatches: (todayMatches ?? []).map(mapMatchToCardData),
    isLoading: leagueLoading || statsLoading || matchesLoading,
  };
}
