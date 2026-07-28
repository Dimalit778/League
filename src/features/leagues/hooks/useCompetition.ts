import { KEYS } from '@/lib/queryClient';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { skipToken, useQuery } from '@tanstack/react-query';
import { competitionApi } from '../api/competitionApi';


export const useGetCompetitions = () => {
  return useQuery({
    queryKey: KEYS.competitions.all,
    queryFn: competitionApi.getCompetitions,
    staleTime: 1000 * 60 * 60 * 24,
  });
};

export const useGetCompetitionsDetails = () => {
  const competitionId = usePrimaryLeagueStore((s) => s.competitionId);

  return useQuery({
    queryKey: competitionId
      ? KEYS.competitions.matchMeta(competitionId)
      : (['competitions', 'match-meta', 'disabled'] as const),
    queryFn: competitionId ? () => competitionApi.getCompetitionsDetails(competitionId) : skipToken,
    staleTime: 1000 * 60 * 5,
  });
};

