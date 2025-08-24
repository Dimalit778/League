import { QUERY_KEYS } from '@/lib/queryKeys';
import { competitionService } from '@/services/competitionService';
import { useQuery } from '@tanstack/react-query';


export const useCompetitionRounds = (competitionId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.leagues,
    queryFn: () => competitionService.getCompetitionRounds(competitionId),
    staleTime: 10 * 60 * 60 * 1000, 
    retry: 2,
  });
};
export const useGetCompetitions = () => {
  return useQuery({
    queryKey: QUERY_KEYS.competitions,
    queryFn: () => competitionService.getCompetitions(),
    staleTime: 10 * 60 * 60 * 1000, // 10 hours
    retry: 2,
  });
};
