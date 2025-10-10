import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { competitionService } from '@/services/competitionService';
import { useQuery } from '@tanstack/react-query';

export const useCompetitionRounds = (leagueId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.competitions.matchdaysByLeague(leagueId),
    queryFn: () => competitionService.getCompetitionRounds(leagueId!),
    enabled: !!leagueId,
  });
};
export const useGetCompetitions = () => {
  return useQuery({
    queryKey: QUERY_KEYS.competitions.all,
    queryFn: () => competitionService.getCompetitions(),
    staleTime: 10 * 60 * 60 * 1000,
    retry: 2,
  });
};
