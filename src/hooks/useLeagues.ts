import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { leagueService } from '@/services/leagueService';
import { useMemberStore } from '@/store/MemberStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentSession } from './useCurrentSession';

export const useGetUserLeagues = () => {
  const { session } = useCurrentSession();
  const userId = session?.user?.id;
  return useQuery({
    queryKey: userId
      ? QUERY_KEYS.users.leagues(userId)
      : (['users', 'unknown', 'leagues'] as const),
    queryFn: () => {
      if (!userId) {
        throw new Error('User id is required to fetch leagues');
      }
      return leagueService.getUserLeagues(userId);
    },
    enabled: !!userId,
  });
};

export const useJoinLeague = (userId: string) => {
  const queryClient = useQueryClient();
  const { initializeMemberLeagues } = useMemberStore();

  return useMutation({
    mutationFn: ({
      join_code,
      nickname,
    }: {
      join_code: string;
      nickname: string;
    }) => leagueService.joinLeague(join_code, nickname),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.leagues(userId),
      });
      await initializeMemberLeagues();
    },

    onError: (error) => {
      console.error('Failed to join league:', error);
    },
  });
};

export const useFindLeagueByJoinCode = (joinCode: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.leagues.byJoinCode(joinCode),
    queryFn: () => leagueService.findLeagueByJoinCode(joinCode),
    enabled: joinCode?.length === 7,
    retry: 1,
  });
};

export const useGetFullLeagueData = (leagueId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.leagues.byId(leagueId),
    queryFn: () => leagueService.getFullLeagueData(leagueId),
    enabled: !!leagueId,
  });
};

export const useLeaveLeague = () => {
  const { session } = useCurrentSession();
  const userId = session?.user?.id as string;
  const queryClient = useQueryClient();
  const { initializeMemberLeagues, setMember } = useMemberStore();

  return useMutation({
    mutationFn: leagueService.leaveLeague,
    onSuccess: async () => {
      // First invalidate queries to get fresh data
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.leagues(userId),
      });

      // Then initialize member leagues which will set member to null if no leagues
      await initializeMemberLeagues();
    },
  });
};

export const useGetLeagueAndMembers = (leagueId?: string) => {
  return useQuery({
    queryKey: leagueId
      ? QUERY_KEYS.leagues.leagueAndMembers(leagueId)
      : (['leagues', 'unknown', 'full'] as const),
    queryFn: () => {
      if (!leagueId) {
        throw new Error('League id is required to fetch members');
      }
      return leagueService.getLeagueAndMembers(leagueId);
    },
    enabled: !!leagueId,
  });
};

export const useUpdateLeague = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leagueId, name }: { leagueId: string; name?: string }) =>
      leagueService.updateLeague(leagueId, { name }),
    onSuccess: async (updated) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.leagues.byId(updated.id),
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.leagues.leagueAndMembers(updated.id),
        }),
      ]);
    },
    onError: (error) => {
      console.error('Failed to update league:', error);
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leagueId, userId }: { leagueId: string; userId: string }) =>
      leagueService.removeMember(leagueId, userId),

    onSuccess: async (_data, { leagueId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.leagues.leagueAndMembers(leagueId),
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.leaderboard.byLeague(leagueId),
        }),
      ]);
    },
    onError: (error) => {
      console.error('Failed to remove member:', error);
    },
  });
};

export const useCreateLeague = () => {
  const { session } = useCurrentSession();
  const userId = session?.user?.id as string;
  const queryClient = useQueryClient();
  const { initializeMemberLeagues } = useMemberStore();
  return useMutation({
    mutationFn: (params: {
      league_name: string;
      nickname: string;
      competition_id: number;
      max_members: number;
      user_id: string;
    }) => leagueService.createLeague(params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.leagues(userId),
      });
      await initializeMemberLeagues();
    },
    onError: (error) => {
      console.error('Failed to create league:', error);
    },
  });
};
