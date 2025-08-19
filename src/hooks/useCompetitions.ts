import { competitionService } from '@/services/competitionService';
import { useQuery } from '@tanstack/react-query';

const QUERY_KEYS = {
  rounds: (competitionId: number) => ['rounds', competitionId],
  competitions: ['competitions'],
}

export const useCompetitionRounds = (competitionId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.rounds(competitionId),
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
