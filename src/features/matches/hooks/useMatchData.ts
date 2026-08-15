import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { KEYS } from '@/lib/queryClient';
import { useLeagueId } from '@/store/PrimaryLeagueStore';
import { prefetchMatchTeamLogos } from '@/utils/prefetchTeamLogos';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useIsFocused } from 'expo-router';
import { useEffect } from 'react';
import { matchesApi } from '../api/matchesApi';
import { getMatchRefetchInterval } from '../utils/matchRefetch';

/** enabled should be `isPro && analysis.status === 'available'` — a free user can never see this, so don't fetch it for them. */
export const useMatchAiSummary = (matchId: number, enabled: boolean) => {
  return useQuery({
    queryKey: KEYS.matches.aiSummary(matchId),
    queryFn: enabled ? () => matchesApi.getMatchAiSummary(matchId) : skipToken,
    staleTime: 1000 * 60 * 30,
  });
};

export const useGetMatchData = (matchId: number) => {
  const leagueId = useLeagueId();
  const isFocused = useIsFocused();
  const isReady = Boolean(leagueId && matchId > 0);
  const query = useQuery({
    queryKey: isReady
      ? KEYS.matches.withPredictions(leagueId!, matchId)
      : (['matches', 'detail', 'disabled', matchId || 'none'] as const),
    queryFn: isReady ? () => matchesApi.getMatchWithPredictions(leagueId!, matchId) : skipToken,
    select: (data) => ({
      ...data,
      predictions: [...(data?.predictions ?? [])].sort((a, b) => {
        const diff = (b.points ?? 0) - (a.points ?? 0);
        if (diff !== 0) return diff;
        return (a.league_member?.nickname ?? '').localeCompare(b.league_member?.nickname ?? '');
      }),
    }),
    refetchInterval: (currentQuery) =>
      isFocused ? getMatchRefetchInterval(currentQuery.state.data) : false,
    refetchIntervalInBackground: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  });

  useRefetchOnFocus(query.refetch, isReady);

  useEffect(() => {
    if (query.data) void prefetchMatchTeamLogos(query.data);
  }, [query.data]);

  return query;
};
