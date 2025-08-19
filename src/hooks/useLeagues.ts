import { leagueService } from '@/services/leagueService';
import { useAppStore } from '@/store/useAppStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const QUERY_KEYS = {
  leagues: ['leagues'] as const,
  league: (id: number) => ['leagues', id] as const,
  myLeagues: (userId: string) => ['users', userId, 'leagues'] as const,
  competitions: ['competitions'] as const,
  leagueByJoinCode: (joinCode: string) => ['leagues', 'joinCode', joinCode] as const,
};

export const useMyLeagues = () => {
  const { session } = useAppStore();
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
  const { session } = useAppStore();

  return useMutation({
    mutationFn: (params: {
      name: string;
      nickname: string;
      league_logo: string;
      join_code: string;
      max_members: number;
      competition_id: number;
    }) => leagueService.createLeague(session?.user?.id!, params.nickname, params as any, params.league_logo ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.myLeagues(session?.user?.id!) 
      });
    },
    onError: (error) => {
      console.error('Failed to create league:', error);
    },
  });
};
export const useJoinLeague = () => {
  const queryClient = useQueryClient();
  const { session } = useAppStore();

  return useMutation({
    mutationFn: ({ join_code, nickname, avatar_url }: { join_code: string; nickname: string, avatar_url?: string }) => 
      leagueService.joinLeague(session?.user?.id!, join_code, nickname,avatar_url?? ''),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.myLeagues(session?.user?.id!) 
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
export const useGetLeagueById = (leagueId: string) => {
  return useQuery({
    queryKey: ['leagues'],
    queryFn: () => leagueService.getLeagueById(leagueId),
    enabled: !!leagueId,
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

