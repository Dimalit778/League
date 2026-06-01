import { KEYS } from '@/lib/queryClient';
import { selectCompetitionId, useMemberStore } from '@/store/MemberStore';
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
  const competitionId = useMemberStore(selectCompetitionId);

  return useQuery({
    queryKey: KEYS.competitions.matchMeta(competitionId ?? 0),
    queryFn: competitionId ? () => competitionApi.getCompetitionsDetails(competitionId) : skipToken,
    staleTime: 1000 * 60 * 60 * 24,
  });
};

export const useGetCompetitionFixtures = useGetCompetitionsDetails;
