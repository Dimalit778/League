import { QUERY_KEYS } from '@/lib/queryKeys';
import { competitionService } from '@/services/competitionService';
import { useMemberStore } from '@/store/MemberStore';
import { useQuery } from '@tanstack/react-query';


export const useCompetitionRounds = () => {
  const { member } = useMemberStore();
  console.log('member', JSON.stringify(member, null, 2));
  if(!member) throw new Error('Member not found');
  return useQuery({
    queryKey: QUERY_KEYS.leagues,
    queryFn: () => competitionService.getCompetitionRounds(member.league_id),
   
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
