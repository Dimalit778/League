import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { useQuery } from '@tanstack/react-query';
import { competitionApi } from '../api/competitionApi';

export const useGetCompetitions = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: QUERY_KEYS.competitions.all,
    queryFn: competitionApi.getCompetitions,

    retry: 2,
  });
  return { data, error, isLoading };
};

export const useGetCompetitionFixtures = (competitionId: number) => {
  return useQuery({
    queryKey: ['competitions', 'fixtures', competitionId],
    queryFn: () => competitionApi.getCompetitionFixtures(competitionId),
    enabled: !!competitionId,
  });
};
