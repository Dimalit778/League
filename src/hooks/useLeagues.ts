import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { leagueService } from '@/services/leagueService';
import { useMemberStore } from '@/store/MemberStore';
import { createLeagueParams } from '@/types/league.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCurrentSession } from './useCurrentSession';

export const useGetLeagues = () => {
  const { session } = useCurrentSession();
  const userId = session?.user?.id as string;
  return useQuery({
    queryKey: QUERY_KEYS.users.leagues(userId),
    queryFn: () => leagueService.getLeagues(userId),
  });
};
// ********************************************************
export const useCreateLeague = () => {
  const { session } = useCurrentSession();
  const userId = session?.user?.id as string;
  const queryClient = useQueryClient();
  const { refreshMemberData } = useMemberStore();

  return useMutation({
    mutationFn: (params: createLeagueParams) =>
      leagueService.createLeague(params),
    onSuccess: async (leagueId) => {
      // Update cached queries and primary membership
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.leagues(userId),
      });
      await refreshMemberData(userId);
      router.push({
        pathname: '/(app)/myLeagues/league-created',
        params: { leagueId: leagueId.league_id },
      });
    },
    onError: (error) => {
      console.error('Failed to create league:', error);
    },
  });
};

// ********************************************************
export const useJoinLeague = () => {
  const { session } = useCurrentSession();
  const userId = session?.user?.id as string;
  const queryClient = useQueryClient();
  const { refreshMemberData } = useMemberStore();

  return useMutation({
    mutationFn: ({
      join_code,
      nickname,
    }: {
      join_code: string;
      nickname: string;
    }) => leagueService.joinLeague(join_code, nickname, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.leagues(userId),
      });
      await refreshMemberData(userId);
    },

    onError: (error) => {
      console.error('Failed to join league:', error);
    },
  });
};

// ********************************************************
export const useFindLeagueByJoinCode = (joinCode: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.leagues.byJoinCode(joinCode),
    queryFn: () => leagueService.findLeagueByJoinCode(joinCode),
    enabled: joinCode?.length === 6,
    retry: 1,
  });
};
// ********************************************************
export const useUpdatePrimaryLeague = () => {
  const { session } = useCurrentSession();
  const userId = session?.user?.id as string;
  const queryClient = useQueryClient();
  const { setMember } = useMemberStore();

  return useMutation({
    mutationFn: ({ leagueId }: { leagueId: string }) =>
      leagueService.updatePrimaryLeague(userId, leagueId),

    onError: (_, context) => {
      console.error('Failed to update primary league:', context);
    },
    onSuccess: async (primaryMember, { leagueId }) => {
      // Update member store immediately
      setMember(primaryMember as any);
      router.push('/(app)/(tabs)/League');
      // Invalidate related queries
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.leagues(userId),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.leaderboard.byLeague(leagueId),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.fixtures.all,
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.predictions.all,
      });
    },
  });
};

// ********************************************************
export const useGetFullLeagueData = (leagueId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.leagues.byId(leagueId),
    queryFn: () => leagueService.getFullLeagueData(leagueId),
    enabled: !!leagueId,
  });
};

// ********************************************************
export const useLeaveLeague = () => {
  const { session } = useCurrentSession();
  const userId = session?.user?.id as string;
  const queryClient = useQueryClient();
  const { refreshMemberData } = useMemberStore();

  return useMutation({
    mutationFn: (leagueId: string) => leagueService.leaveLeague(leagueId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.leagues(userId),
      });
      await refreshMemberData(userId);
    },

    onError: (error) => {
      console.error('Failed to leave league:', error);
    },
  });
};

// ********************************************************
export const useGetLeagueAndMembers = (leagueId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.leagues.leagueAndMembers(leagueId as string),
    queryFn: () => leagueService.getLeagueAndMembers(leagueId as string),
    enabled: !!leagueId,
  });
};

// ********************************************************
export const useUpdateLeague = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leagueId, name }: { leagueId: string; name?: string }) =>
      leagueService.updateLeague(leagueId, { name }),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.leagues.byId(updated.id),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.leagues.leagueAndMembers(updated.id),
      });
    },
    onError: (error) => {
      console.error('Failed to update league:', error);
    },
  });
};

// ********************************************************
export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leagueId, userId }: { leagueId: string; userId: string }) =>
      leagueService.removeMember(leagueId, userId),
    onSuccess: async (_data, { leagueId }) => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.leagues.leagueAndMembers(leagueId),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.leagues.byId(leagueId),
      });
    },
    onError: (error) => {
      console.error('Failed to remove member:', error);
    },
  });
};
