import { competitionApi } from '@/features/leagues/api/competitionApi';
import { leagueApi } from '@/features/leagues/api/leagueApi';
import { KEYS } from '@/lib/queryClient';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { InteractionManager } from 'react-native';
import { matchesApi } from '../api/matchesApi';

const STALE_TIME = 1000 * 60 * 5;

/**
 * Warms the caches for the tabs the user is most likely to open after landing
 * on Overview (Matches and the friends Leaderboard), so those tabs render from
 * cache instead of showing a spinner on the first visit of a session.
 *
 * Deliberately DEFERRED with InteractionManager.runAfterInteractions: an eager
 * prefetch on mount fired a burst of queries (incl. the heavy season fetch)
 * that competed with Overview's own load and made every screen feel slow. By
 * waiting until the current screen has rendered and its interactions settle,
 * the prefetch runs quietly in the background without slowing the screen the
 * user is on. On warm starts these keys are already in MMKV, so prefetchQuery
 * is a no-op there; this mainly smooths the first session after login.
 *
 * Only the destination tabs are warmed — Overview's own queries (league members,
 * stats, today's matches) are left to Overview itself.
 */
export const usePrefetchLeagueData = () => {
  const queryClient = useQueryClient();
  const memberId = usePrimaryLeagueStore((state) => state.memberId);
  const leagueId = usePrimaryLeagueStore((state) => state.leagueId);
  const competitionId = usePrimaryLeagueStore((state) => state.competitionId);
  const seasonId = usePrimaryLeagueStore((state) => state.seasonId);

  useEffect(() => {
    if (competitionId == null || seasonId == null || memberId == null || leagueId == null) {
      return;
    }

    const task = InteractionManager.runAfterInteractions(() => {
      // Matches tab: gated on competition meta, then the season fixtures.
      void queryClient.prefetchQuery({
        queryKey: KEYS.competitions.matchMeta(competitionId),
        queryFn: () => competitionApi.getCompetitionsDetails(competitionId),
        staleTime: STALE_TIME,
      });
      void queryClient.prefetchQuery({
        queryKey: KEYS.matches.season(competitionId, seasonId, memberId),
        queryFn: () => matchesApi.getSeasonMatches(competitionId, seasonId, memberId),
        staleTime: STALE_TIME,
      });

      // Leaderboard tab (friends audience is the default view).
      void queryClient.prefetchQuery({
        queryKey: KEYS.leagues.leaderboard(leagueId),
        queryFn: () => leagueApi.getLeaderboardView(leagueId),
        staleTime: STALE_TIME,
      });
    });

    return () => task.cancel();
  }, [queryClient, memberId, leagueId, competitionId, seasonId]);
};
