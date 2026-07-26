import { KEYS } from '@/lib/queryClient';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { prefetchMatchTeamLogos } from '@/utils/prefetchTeamLogos';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { matchesApi } from '../api/matchesApi';

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
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (query.data) void prefetchMatchTeamLogos(query.data);
  }, [query.data]);

  return query;
};
