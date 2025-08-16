import { useLeagueService } from '@/features/myLeagues/services/leagueService';
import { useAppStore } from '@/store/useAppStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const QUERY_KEYS = {
  leagues: ['leagues'] as const,
  league: (id: string) => ['leagues', id] as const,
  myLeagues: (userId: string) => ['users', userId, 'leagues'] as const,
  competitions: ['competitions'] as const,
  leagueByJoinCode: (joinCode: string) => ['leagues', 'joinCode', joinCode] as const,
};

export const useMyLeagues = () => {
  const { session } = useAppStore();
  const leagueService = useLeagueService();

  return useQuery({
    queryKey: QUERY_KEYS.myLeagues(session?.user?.id!),
    queryFn: () => leagueService.getLeagues(session?.user?.id!),
    enabled: !!session?.user?.id,
    staleTime: 60 * 1000 * 60, 
    retry: 2,
  });
};

export const useCreateLeague = () => {
  const queryClient = useQueryClient();
  const { session } = useAppStore();
  const leagueService = useLeagueService();

  return useMutation({
    mutationFn: (params: {
      name: string;
      nickname: string;
      league_logo: string;
      join_code: string;
      max_members: number;
      competition_id: number;
    }) => leagueService.createLeague(session?.user?.id!, params.nickname, params as any  ),
    onSuccess: (data) => {
      // Invalidate and refetch leagues
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.myLeagues(session?.user?.id!) 
      });
    },
    onError: (error) => {
      console.error('Failed to create league:', error);
    },
  });
};
//Work
export const useJoinLeague = () => {
  const queryClient = useQueryClient();
    const { session } = useAppStore();
  const leagueService = useLeagueService();

  return useMutation({
    mutationFn: ({ join_code, nickname, avatar_url }: { join_code: string; nickname: string; avatar_url?: string }) => 
      leagueService.joinLeague(session?.user?.id!, join_code, nickname, avatar_url),
    onSuccess: (result, variables) => {
      if (!result[0].success) {
        throw new Error(result[0].message);
      }
      
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.myLeagues(session?.user?.id!) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.myLeagues(session?.user?.id!) 
      });
    },
    onError: (error) => {
      console.error('Failed to join league:', error);
    },
  });
};

export const useCompetitions = () => {
  const leagueService = useLeagueService();
  return useQuery({
    queryKey: QUERY_KEYS.competitions,
    queryFn: () => leagueService.getCompetitions(),
    staleTime: 10 * 60 * 1000, // 10 minutes - competitions don't change often
    retry: 2,
  });
};
//Work
export const useFindLeagueByJoinCode = (joinCode: string) => {
  const leagueService = useLeagueService();
  return useQuery({
    queryKey: QUERY_KEYS.leagueByJoinCode(joinCode),
    queryFn: async () => {
      const { data, error } = await leagueService.findLeagueByJoinCode(joinCode);
      if (error) throw error;
      return data;
    },
    enabled: joinCode?.length === 6,
    retry: 1,
  });
};
export const useGetLeagueDetails = (leagueId: string) => {
  const leagueService = useLeagueService();
  return useQuery({
    queryKey: QUERY_KEYS.league(leagueId),
    queryFn: () => leagueService.getLeagueDetails(leagueId),
    enabled: !!leagueId,
    staleTime: 60 * 1000 * 60, 
    retry: 2,
  });
};


// export const useSetPrimaryLeague = () => {
//   const queryClient = useQueryClient();
//   const { session } = useAuthStore();
//   const leagueService = useLeagueService();

//   return useMutation({
//     mutationFn: ({ leagueId }: { leagueId: number }) => 
//       leagueService.setPrimaryLeague(session?.user?.id!, leagueId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ 
//         queryKey: QUERY_KEYS.myLeagues(session?.user?.id!) 
//       });
//     },
//     onError: (error) => {
//       console.error('Failed to set primary league:', error);
//     },
//   });
// };

// export const useLeaveLeague = () => {
//   const queryClient = useQueryClient();
//   const { session } = useAuthStore();
//   const leagueService = useLeagueService();

//   return useMutation({
//     mutationFn: ({ leagueId }: { leagueId: number }) => 
//       leagueService.leaveLeague(session?.user?.id!, leagueId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ 
//         queryKey: QUERY_KEYS.myLeagues(session?.user?.id!) 
//       });
//     },
//     onError: (error) => {
//       console.error('Failed to leave league:', error);
//     },
//   });
// };

// export const useUpdateLeagueName = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: async (params: {
//       leagueId: string;
//       name: string;
//     }) => {
//       const { data, error } = await supabase
//         .from('leagues')
//         .update({ name: params.name, updated_at: new Date().toISOString() })
//         .eq('id', params.leagueId)
//         .select()
//         .single();
      
//       if (error) throw error;
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: queryKeys.leagues });
//     },
//   });
// };
// export const useSetPrimaryLeague = () => {
//   const leagueService = useLeagueService();
//   const queryClient = useQueryClient();
//   const { user } = useAppStore();
  
//   return useMutation({
//     mutationFn: async (leagueId: string) => {
//       if (!user) throw new Error('User not authenticated');
      
//       // First, set all user's leagues to non-primary
//       await leagueService.setPrimaryLeague(user.id, leagueId)
      
      
      
//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: queryKeys.leagues });
//     },
//   });
// };
// export const useRemoveLeagueMember = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: async (params: {
//       leagueId: string;
//       userId: string;
//     }) => {
//       const { error } = await supabase
//         .from('league_members')
//         .delete()
//         .eq('league_id', params.leagueId)
//         .eq('user_id', params.userId);
      
//       if (error) throw error;
//     },
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ 
//         queryKey: queryKeys.leagueMembers(variables.leagueId)
//       });
//       queryClient.invalidateQueries({ queryKey: queryKeys.leagues });
//     },
//   });
// };
// export const useDeleteLeague = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: async (leagueId: string) => {
//       const { error } = await supabase
//         .from('leagues')
//         .delete()
//         .eq('id', leagueId);
      
//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: queryKeys.leagues });
//     },
//   });
// };