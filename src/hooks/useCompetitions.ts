import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { competitionService } from '@/services/competitionService';
import { useMemberStore } from '@/store/MemberStore';
import { useQuery } from '@tanstack/react-query';

export const useCompetitionRounds = () => {
  const { member } = useMemberStore();

  if (!member) throw new Error('Member not found');
  return useQuery({
    queryKey: QUERY_KEYS.competitions.rounds(member.league_id),
    queryFn: () => competitionService.getCompetitionRounds(member.league_id),
  });
};
export const useGetCompetitions = () => {
  return useQuery({
    queryKey: QUERY_KEYS.competitions.all,
    queryFn: () => competitionService.getCompetitions(),
    staleTime: 10 * 60 * 60 * 1000, // 10 hours
    retry: 2,
  });
};
