import { useGetLeagueAndMembers } from "@/features/leagues/hooks/useLeagues";
import { LeagueOverview } from "@/features/leagues/types";
import { useGetTodayMatches } from "@/features/matches/hooks/useTodayMatches";
import { mapMatchToCardData } from "@/features/matches/utils/matchCard.mapper";
import { useMemberStats } from "@/features/members/hooks/useMemberStats";
import { useLanguageStore } from "@/store/LanguageStore";
import {
  useCompetitionId,
  useLeagueId,
  useMemberId,
  usePrimaryLeagueStore,
} from "@/store/PrimaryLeagueStore";

export function useLeagueOverview(): LeagueOverview {
  const memberId = useMemberId();
  const leagueId = useLeagueId();
  const competitionId = useCompetitionId();
  const language = useLanguageStore((state) => state.language);
  const locale = language === "he" ? "he-IL" : "en-GB";

  const nickname = usePrimaryLeagueStore((state) => state.nickname);
  const avatarUrl = usePrimaryLeagueStore((state) => state.avatarUrl);

  const { data: league, isLoading: leagueLoading } = useGetLeagueAndMembers(
    leagueId,
  );
  const { data: stats, isLoading: statsLoading } = useMemberStats(memberId);
  const { data: todayMatches } = useGetTodayMatches({
    competitionId,
    memberId,
  });

  return {
    leagueSummary: {
      nickname: nickname ?? "",
      avatarUrl: avatarUrl ?? null,
      leagueName: league?.name ?? "",
      competitionName: league?.competition?.name ?? "",
      flagUrl: league?.competition?.flag ?? "",
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
    todayMatches: (todayMatches ?? []).map((match) =>
      mapMatchToCardData(match, locale)
    ),

    isLoading: leagueLoading || statsLoading,
  };
}
