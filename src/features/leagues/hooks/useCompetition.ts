import { KEYS } from '@/lib/queryClient';
import { useMemberStore } from '@/store/MemberStore';
import { skipToken, useQuery } from '@tanstack/react-query';
import { competitionApi } from '../api/competitionApi';

export const useGetCompetitions = () => {
  return useQuery({
    queryKey: KEYS.competitions.all,
    queryFn: competitionApi.getCompetitions,
    staleTime: 1000 * 60 * 60 * 24,
  });
};

export const useGetCompetitionFixtures = () => {
  const competitionId = useMemberStore((s) => s.competitionId);
  return useQuery({
    queryKey: KEYS.competitions.fixtures(competitionId ?? 0),
    queryFn: competitionId ? () => competitionApi.getCompetitionFixtures(competitionId) : skipToken,
    staleTime: 1000 * 60 * 60 * 24,
  });
};
