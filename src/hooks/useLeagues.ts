import { QUERY_KEYS } from '@/lib/queryKeys';
import { leagueService } from '@/services/leagueService';
import { useMemberStore } from '@/store/MemberStore';
import { createLeagueParams } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';


export const useMyLeagues = () => {
  const { member } = useMemberStore();
  return useQuery({
    queryKey: QUERY_KEYS.allLeagues,
    queryFn: () =>  leagueService.getMyLeagues(member?.user_id as string),
    enabled: !!member?.user_id,
    staleTime: 60 * 1000 * 60, 
    retry: 2,
  });
};
export const useCreateLeague = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ( params: createLeagueParams ) =>  leagueService.createLeague( params ),
    onSuccess: async (leagueId) => {
      const { initializeMembers } = useMemberStore.getState();
      await initializeMembers();
      router.push({ 
        pathname: '/(app)/myLeagues/league-created',
        params: { leagueId: leagueId.league_id  },
      });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allLeagues });

      },
      onError: (error) => {
        console.error('Failed to create league:', error);
      },
      onSettled: async () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allLeagues });
      },
    });
  };
export const useJoinLeague = () => {

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ join_code, nickname}: { join_code: string; nickname: string; }) => 
      leagueService.joinLeague(  join_code, nickname),
      onSuccess: async () => {
        const { initializeMembers } = useMemberStore.getState();
        await initializeMembers();
      },
      onSettled: async () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allLeagues }); 
    
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leagueId, userId }: { leagueId: string; userId: string }) => leagueService.updatePrimaryLeague(userId, leagueId),
    onSuccess: async ( _, {  userId }) => {
      const { initializeMembers } = useMemberStore.getState();
      await initializeMembers();
      router.push('/(app)/(tabs)/League');  
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allLeagues });
    },
    onError: (error) => {
      console.error('Failed to update primary league:', error);
    },
    onSettled: ( _, __, {  userId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allLeagues });
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

export const useLeaveLeague = () => {
  
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (leagueId: string) => leagueService.leaveLeague(leagueId),
    onMutate: async (leagueId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.allLeagues });
    },
    onSuccess: async (_, leagueId) => {
      const { initializeMembers } = useMemberStore.getState();
      await initializeMembers();
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.allLeagues
      });
    },
    onError: (error) => { 
      console.error('Failed to leave league:', error);
    },
    onSettled: (_, __, leagueId) => {
        // This runs whether success or error
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.allLeagues
        });
      },
    });
  
};


