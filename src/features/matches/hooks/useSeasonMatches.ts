import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { KEYS } from '@/lib/queryClient';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useIsFocused } from 'expo-router';
import { matchesApi } from '../api/matchesApi';
import { getMatchesRefetchInterval } from '../utils/matchRefetch';

export const useSeasonMatches = ({
  competitionId,
  memberId,
  enabled = true,
}: {
  competitionId: number | null;
  memberId: string | null;
  enabled?: boolean;
}) => {
  const seasonId = usePrimaryLeagueStore((state) => state.seasonId);
  const isFocused = useIsFocused();

  const isReady = enabled && competitionId != null && seasonId != null && memberId != null;

  const query = useQuery({
    queryKey: isReady
      ? KEYS.matches.season(competitionId, seasonId, memberId)
      : ([
          'matches',
          'season',
          'disabled',
          competitionId ?? 'none',
          seasonId ?? 'none',
          memberId ?? 'none',
        ] as const),
    queryFn: isReady ? () => matchesApi.getSeasonMatches(competitionId, seasonId, memberId) : skipToken,
    enabled: isReady,
    staleTime: 1000 * 60 * 5,
    refetchInterval: (currentQuery) =>
      isFocused ? getMatchesRefetchInterval(currentQuery.state.data) : false,
    refetchIntervalInBackground: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    placeholderData: (previousData) => previousData,
  });

  useRefetchOnFocus(query.refetch, isReady);

  return query;
};
