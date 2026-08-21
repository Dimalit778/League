import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { KEYS } from '@/lib/queryClient';
import { useLeagueId } from '@/store/PrimaryLeagueStore';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useIsFocused } from 'expo-router';
import { matchesApi } from '../api/matchesApi';
import { sortMemberPredictions } from '../model/predictions';
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
      predictions: sortMemberPredictions(data?.predictions),
    }),
    refetchInterval: (currentQuery) =>
      isFocused ? getMatchRefetchInterval(currentQuery.state.data) : false,
    refetchIntervalInBackground: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  });

  useRefetchOnFocus(query.refetch, isReady);

  return query;
};
