import { QUERY_KEYS } from '@/lib/queryKeys';
import { leagueService } from '@/services/leagueService';
import { useMemberStore } from '@/store/MemberStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type CreateLeagueParams = {
  name: string;
  competition_id: number;
  max_members: number;
  nickname: string;
}

export const useMyLeagues = ( ) => {
  const { member } = useMemberStore();
  if(!member) throw new Error('Member not found');
  return useQuery({
    queryKey: QUERY_KEYS.myLeagues(member.user_id),
    queryFn: () => leagueService.getMyLeagues(member.user_id),
    enabled: !!member,
    staleTime: 60 * 1000 * 60, 
    retry: 2,
  });
};
export const useCreateLeague = () => {
  const { member } = useMemberStore();
  if(!member) throw new Error('Member not found');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateLeagueParams) => leagueService.createLeagueAndMember(params, member.user_id),
    onSuccess: () => {
        queryClient.invalidateQueries();
      },
      onError: (error) => {
        console.error('Failed to create league:', error);
      },
      onSettled: () => {
        
      } 
    });
  };
export const useJoinLeague = () => {
  const { member } = useMemberStore();
  if(!member) throw new Error('Member not found');

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ join_code, nickname}: { join_code: string; nickname: string }) => 
      leagueService.joinLeague(member.user_id, join_code, nickname),
      onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.myLeagues(member.user_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['leagues', variables.join_code, 'members'] 
      });
    },
    onError: (error) => {
      console.error('Failed to join league:', error);
    },
  });
};

export const useFindLeagueByJoinCode = (joinCode: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.leagueByJoinCode(joinCode),
    queryFn: () => leagueService.findLeagueByJoinCode(joinCode),
    enabled: joinCode?.length === 6,
    retry: 1,
  });
};
  export const useUpdatePrimaryLeague = () => {
  const { member } = useMemberStore();
  if(!member) throw new Error('Member not found');

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leagueId: string) => leagueService.updatePrimaryLeague(member.user_id, leagueId),
    onSuccess: () => {
      useMemberStore.getState().initializeMembers();
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Failed to update primary league:', error);
    },
  });
};
export const useGetFullLeagueAndMembersById = (leagueId: string) => {

  return useQuery({
    queryKey: ['league', leagueId],
    queryFn: () => leagueService.getFullLeagueAndMembersById(leagueId),
    enabled: !!leagueId,
  });
};  


