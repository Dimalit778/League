import { useGetLeagueAndMembers } from '@/features/leagues/hooks/useLeagues';
import { LeagueOverview } from '@/features/leagues/types';
import { useGetUpcomingMatches } from '@/features/matches/hooks/useUpcomingMatches';
import { mapMatchToCardData } from '@/features/matches/utils/matchCard.mapper';
import { useMemberStats } from '@/features/members/hooks/useMemberStats';
import {
  useCompetitionId,
  useLeagueId,
  useMemberId,
  usePrimaryLeagueStore,
} from '@/store/PrimaryLeagueStore';
import { useLanguageStore } from '@/store/LanguageStore';

// Zero-state so the screen always receives a defined stats object,
// matching how leagueSummary/upcomingMatches are normalized below.


export function useLeagueOverview(): LeagueOverview {
  const memberId = useMemberId();
  const leagueId = useLeagueId();
  const competitionId = useCompetitionId();
  const language = useLanguageStore((state) => state.language);
  const locale = language === 'he' ? 'he-IL' : 'en-GB';

  // nickname/avatar already live in the active-league store (populated on login
  // and patched on profile mutations) — no need to refetch the member here.
  const nickname = usePrimaryLeagueStore((state) => state.nickname);
  const avatarUrl = usePrimaryLeagueStore((state) => state.avatarUrl);

  // Both can start in parallel — IDs already live in the active-league store.
  const { data: league, isLoading: leagueLoading } = useGetLeagueAndMembers(leagueId);
  const { data: stats, isLoading: statsLoading } = useMemberStats(memberId);
  const { data: upcomingMatches } = useGetUpcomingMatches({
    competitionId,
    memberId,
  });

  return {
    leagueSummary: {
      nickname: nickname ?? '',
      avatarUrl: avatarUrl ?? null,
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
    upcomingMatches: (upcomingMatches ?? []).map((match) => mapMatchToCardData(match, locale)),
 
    isLoading: leagueLoading || statsLoading,
  };
}
