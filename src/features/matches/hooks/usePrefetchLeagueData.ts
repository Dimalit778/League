import { competitionApi } from '@/features/leagues/api/competitionApi';
import { leagueApi } from '@/features/leagues/api/leagueApi';
import { memberStatsApi } from '@/features/members/api/memberStatsApi';
import { KEYS } from '@/lib/queryClient';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { matchesApi } from '../api/matchesApi';

const STALE_TIME = 1000 * 60 * 5;

/**
 * Warms the caches for the league tabs as soon as the league is entered, so
 * the Home, Matches, and Leaderboard tabs render from cache instead of showing
 * a spinner. Home's own queries (league members + member stats) are prefetched
 * here too — they also feed Leaderboard and Profile — so the Home skeleton
 * clears sooner.
 *
 * Each prefetch uses the exact query key + staleTime as the screen's own hook
 * ({@link useSeasonMatches}, {@link useGetLeaderboard},
 * {@link useGetLeagueAndMembers}, {@link useMemberStats}), so the screen reuses
 * this cache entry and prefetchQuery skips the network when the data is still
 * fresh (or already persisted to MMKV from a previous launch).
 */
export const usePrefetchLeagueData = () => {
  const queryClient = useQueryClient();
  const memberId = usePrimaryLeagueStore((state) => state.memberId);
  const leagueId = usePrimaryLeagueStore((state) => state.leagueId);
  const competitionId = usePrimaryLeagueStore((state) => state.competitionId);
  const seasonId = usePrimaryLeagueStore((state) => state.seasonId);

  useEffect(() => {
    if (competitionId != null) {
      // The Matches screen gates its skeleton on this competition meta and only
      // enables the season query once it resolves, so it must be warmed too.
      void queryClient.prefetchQuery({
        queryKey: KEYS.competitions.matchMeta(competitionId),
        queryFn: () => competitionApi.getCompetitionsDetails(competitionId),
        staleTime: STALE_TIME,
      });
    }

    if (competitionId != null && seasonId != null && memberId != null) {
      void queryClient.prefetchQuery({
        queryKey: KEYS.matches.season(competitionId, seasonId, memberId),
        queryFn: () => matchesApi.getSeasonMatches(competitionId, seasonId, memberId),
        staleTime: STALE_TIME,
      });
    }

    if (leagueId != null) {
      void queryClient.prefetchQuery({
        queryKey: KEYS.leagues.leaderboard(leagueId),
        queryFn: () => leagueApi.getLeaderboardView(leagueId),
        staleTime: STALE_TIME,
      });

      void queryClient.prefetchQuery({
        queryKey: KEYS.leagues.members(leagueId),
        queryFn: () => leagueApi.getLeagueAndMembers(leagueId),
        staleTime: STALE_TIME,
      });
    }

    if (memberId != null) {
      void queryClient.prefetchQuery({
        queryKey: KEYS.members.stats(memberId),
        queryFn: () => memberStatsApi.getMemberStats(memberId),
        staleTime: STALE_TIME,
      });
    }
  }, [queryClient, memberId, leagueId, competitionId, seasonId]);
};
