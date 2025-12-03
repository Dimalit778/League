import { KEYS } from '@/lib/queryClient';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/providers/AuthProvider';
import { useAuthStore } from '@/store/AuthStore';
import { useMemberStore } from '@/store/MemberStore';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { leagueApi } from '../api/leagueApi';
export const useMyLeagues = () => {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  return useQuery({
    queryKey: KEYS.users.leagues(userId),
    queryFn: () => leagueApi.getMyLeagues(userId),
    enabled: !!userId,
  });
};

export const useMyLeaguesView = () => {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  return useQuery({
    queryKey: [...KEYS.users.leagues(userId), 'view'] as const,
    queryFn: () => leagueApi.getMyLeaguesView(userId),
    enabled: !!userId,
  });
};

export const useGetLeaderboard = (leagueId: string) => {
  return useQuery({
    queryKey: KEYS.leagues.leaderboard(leagueId),
    enabled: !!leagueId,
    queryFn: async () => await leagueApi.getLeaderboardView(leagueId),
    staleTime: 5000 * 60 * 5,
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => leagueApi.removeMember(memberId),

    onSuccess: async (result, memberId) => {
      const leagueId = result.leagueId;
      if (leagueId) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: KEYS.leagues.members(leagueId),
          }),
          queryClient.invalidateQueries({
            queryKey: KEYS.leagues.leaderboard(leagueId),
          }),
        ]);
      }
    },
    onError: (error) => {
      console.error('Failed to remove member:', error);
    },
  });
};

export const useGetLeagueWithCompetition = (leagueId?: string) => {
  return useQuery({
    queryKey: leagueId ? KEYS.leagues.detail(leagueId) : (['leagues', 'unknown', 'withCompetition'] as const),
    enabled: !!leagueId,
    queryFn: () => leagueApi.getLeagueWithCompetition(leagueId!),
  });
};

export const useGetLeagueAndMembers = (leagueId?: string) => {
  return useQuery({
    queryKey: leagueId ? KEYS.leagues.members(leagueId) : (['leagues', 'unknown', 'full'] as const),
    enabled: !!leagueId,
    queryFn: () => leagueApi.getLeagueAndMembers(leagueId!),
  });
};

export const useUpdatePrimaryLeague = () => {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const queryClient = useQueryClient();
  const initializeMember = useMemberStore((s) => s.initializeMember);
  return useMutation({
    mutationFn: ({ leagueId }: { leagueId: string }) => leagueApi.updatePrimaryLeague(userId, leagueId),
    onSuccess: async (data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: KEYS.leagues.leaderboard(variables.leagueId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.members.primary(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.users.leagues(userId),
        }),
      ]);
      initializeMember();
    },
    onError: (error) => {
      console.error('Failed to update primary league:', error);
      initializeMember();
    },
  });
};
//  -- LEAGUE OPERATIONS
export const useCreateLeague = () => {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      league_name: string;
      nickname: string;
      competition_id: number;
      max_members: number;
    }) => {
      const leagueId = await leagueApi.createLeague(params);
      return leagueId;
    },

    onSuccess: async (leagueId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: KEYS.users.leagues(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.members.primary(userId),
        }),
      ]);
      router.replace({
        pathname: '/(app)/(public)/myLeagues/preview-league',
        params: { leagueId },
      });
    },
    onError: (error) => {
      console.error('Failed to create league:', error);
    },
  });
};
export const useJoinLeague = () => {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ join_code, nickname }: { join_code: string; nickname: string }) =>
      leagueApi.joinLeague(join_code, nickname),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: KEYS.users.leagues(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.members.primary(userId),
        }),
      ]);
      console.log('joined league ------->,');
    },

    onError: (error) => {
      console.log('error ------->,', JSON.stringify(error));
      console.error('Failed to join league:', error);
    },
  });
};
export const useUpdateLeague = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  return useMutation({
    mutationFn: ({ leagueId, name }: { leagueId?: string; name?: string }) => {
      if (!leagueId) {
        throw new Error('League id is required to update league');
      }
      return leagueApi.updateLeague(leagueId, { name });
    },
    onSuccess: async (updated) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: KEYS.leagues.detail(updated.id),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.leagues.members(updated.id),
        }),
        userId &&
          queryClient.invalidateQueries({
            queryKey: KEYS.members.primary(userId),
          }),
      ]);
    },
    onError: (error) => {
      console.error('Failed to update league:', error);
    },
  });
};
export const useLeaveLeague = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useMutation({
    mutationFn: async (leagueId: string) => {
      const result = await leagueApi.leaveLeague(leagueId);
      return result;
    },
    onSuccess: async (result, leagueId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: KEYS.leagues.leaderboard(leagueId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.leagues.members(leagueId),
        }),
        userId &&
          queryClient.invalidateQueries({
            queryKey: KEYS.members.primary(userId),
          }),
      ]);
      router.replace('/(app)/(public)/myLeagues');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });
};
export const useDeleteLeague = () => {
  const queryClient = useQueryClient();
  const initializeMember = useMemberStore((s) => s.initializeMember);
  return useMutation({
    mutationFn: async ({ leagueId, userId }: { leagueId: string; userId: string }) => {
      const result = await leagueApi.deleteLeague(leagueId, userId);
      return result;
    },
    onSuccess: async (result, { leagueId, userId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: KEYS.leagues.all,
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.users.all,
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.members.all,
        }),
        await initializeMember(),
        router.replace('/(app)/(public)/myLeagues'),
      ]);
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });
};
