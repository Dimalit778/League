import { QUERY_KEYS } from '@/lib/queryKeys';
import { leagueService } from '@/services/leagueService';
import { CreateLeagueParams } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useMyLeagues = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.myLeagues(userId),
    queryFn: () => leagueService.getMyLeagues(userId),
    enabled: !!userId,
    staleTime: 60 * 1000 * 60, 
    retry: 2,
  });
};
export const useCreateLeague = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateLeagueParams) => leagueService.createLeagueAndMember(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.myLeagues(userId) 
      });
    },
    onError: (error) => {
      console.error('Failed to create league:', error);
    },
  });
};
export const useJoinLeague = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ join_code, nickname}: { join_code: string; nickname: string }) => 
      leagueService.joinLeague(userId, join_code, nickname),
      onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.myLeagues(userId) 
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
  export const useUpdatePrimaryLeague = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leagueId: string) => leagueService.updatePrimaryLeague(userId, leagueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.myLeagues(userId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.leagues 
      });
      queryClient.invalidateQueries({
        predicate: (query) => 
          query.queryKey[0] === 'leaderboard' || 
          (Array.isArray(query.queryKey) && query.queryKey.includes('leaderboard'))
      });
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Failed to update primary league:', error);
    },
  });
};


