import { useLeagueService } from '@/services/leagueService';
import useAuthStore from '@/store/useAuthStore';
import useLeagueStore from '@/store/useLeagueStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const QUERY_KEYS = {
  leagues: ['leagues'] as const,
  league: (id: number) => ['leagues', id] as const,
  myLeagues: (userId: string) => ['users', userId, 'leagues'] as const,
  competitions: ['competitions'] as const,
  leagueByJoinCode: (joinCode: string) => ['leagues', 'joinCode', joinCode] as const,
};

export const useMyLeagues = () => {
  const { session } = useAuthStore();
  const leagueService = useLeagueService();

  return useQuery({
    queryKey: QUERY_KEYS.myLeagues(session?.user?.id!),
    queryFn: () => leagueService.getMyLeagues(session?.user?.id!),
    enabled: !!session?.user?.id,
    staleTime: 60 * 1000 * 60, 
    retry: 2,
  });
};

export const useCreateLeague = () => {
  const queryClient = useQueryClient();
  const { session } = useAuthStore();
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
  const { session } = useAuthStore();
  const leagueService = useLeagueService();

  return useMutation({
    mutationFn: ({ leagueId, nickname }: { leagueId: number; nickname: string }) => 
      leagueService.joinLeague(session?.user?.id!, leagueId, nickname),
    onSuccess: (result, variables) => {
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.myLeagues(session?.user?.id!) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['leagues', variables.leagueId, 'members'] 
      });
    },
    onError: (error) => {
      console.error('Failed to join league:', error);
    },
  });
};
export const useGetLeagueById = (leagueId: number) => {
  const leagueService = useLeagueService();
  return useQuery({
    queryKey: ['leagues'],
    queryFn: () => leagueService.getLeagueById(leagueId),
    enabled: !!leagueId,
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
export const useGetLeaderboard = () => {
  const leagueService = useLeagueService();
  const { primaryLeague } = useLeagueStore();
  return useQuery({
    queryKey: ['leagues', primaryLeague.id, 'leaderboard'],
    queryFn: () => leagueService.getLeaderboard(primaryLeague.id),
    enabled: !!primaryLeague.id,
    staleTime: 60 * 1000 * 60, 
    retry: 2,
  });
};

