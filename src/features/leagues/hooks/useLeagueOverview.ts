import { useGetLeagueAndMembers } from '@/features/leagues/hooks/useLeagues';
import { LeagueOverview } from '@/features/leagues/types/leagueOverviewType';
import { useGetTodayMatches } from '@/features/matches/hooks/useMatches';
import { mapMatchToCardData } from '@/features/matches/utils/matchCard.mapper';
import { useGetMember } from '@/features/members/hooks/useMembers';
import { useMemberStats } from '@/features/members/hooks/useMemberStats';
import { useCompetitionId, useLeagueId, useMemberId } from '@/store/PrimaryLeagueStore';

// Zero-state so the screen always receives a defined stats object,
// matching how leagueSummary/upcomingMatches are normalized below.


export function useLeagueOverview(): LeagueOverview {
  const memberId = useMemberId();
  const leagueId = useLeagueId();
  const competitionId = useCompetitionId();

  // All three can start in parallel — IDs already live in the active-league store.
  const { data: member, isLoading: memberLoading } = useGetMember(memberId);
  const { data: league, isLoading: leagueLoading } = useGetLeagueAndMembers(leagueId);
  const { data: stats, isLoading: statsLoading } = useMemberStats(memberId);
  const { data: todayMatches } = useGetTodayMatches({
    competitionId,
    memberId,
  });

  return {
    leagueSummary: {
      nickname: member?.nickname ?? '',
      avatarUrl: member?.avatar_url ?? null,
      leagueName: league?.name ?? '',
      logoUrl: league?.competition?.logo ?? '',
      flagUrl: league?.competition?.flag ?? '',
      rank: stats?.rank ?? 0,
      points: stats?.totalPoints ?? 0,
      membersCount: league?.league_members?.length ?? 0,
    },
    stats: {
      totalPredictions: stats?.totalPredictions ?? 0,
      bingoHits: stats?.bingoHits ?? 0,
      regularHits: stats?.regularHits ?? 0,
      missedHits: stats?.missedHits ?? 0,
      accuracy: stats?.accuracy ?? 0,
      totalPoints: stats?.totalPoints ?? 0,
      pendingPredictions: stats?.pendingPredictions ?? 0,
      rank: stats?.rank ?? 0,
      totalMembers: stats?.totalMembers ?? 0,
      currentStreak: stats?.currentStreak ?? 0,
      longestStreak: stats?.longestStreak ?? 0,
      recentForm: stats?.recentForm ?? [],
    },
    upcomingMatches: (todayMatches ?? []).map(mapMatchToCardData),
    // Don't block the whole screen on matches — they sit below the fold.
    isLoading: memberLoading || leagueLoading || statsLoading,
  };
}
