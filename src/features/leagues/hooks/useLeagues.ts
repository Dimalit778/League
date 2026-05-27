import { KEYS } from '@/lib/queryClient';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { canCreateLeague, canCreateLeagueWithSize } from '@/features/subscription/utils/subscriptionGuards';
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

export const useGetLeaderboard = (leagueId: string) => {
  return useQuery({
    queryKey: KEYS.leagues.leaderboard(leagueId),
    enabled: !!leagueId,
    queryFn: async () => await leagueApi.getLeaderboardView(leagueId),
    staleTime: 1000 * 60 * 5,
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => leagueApi.removeMember(memberId),

    onSuccess: async (result, memberId) => {
      const leagueId = result?.leagueId;
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
      Alert.alert('Error', error.message);
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
    mutationFn: ({ leagueId }: { leagueId: string }) => leagueApi.updatePrimaryLeague(leagueId),
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
      await initializeMember();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });
};
export const useFindLeagueByJoinCode = (joinCode: string) => {
  const normalizedJoinCode = joinCode?.trim().toUpperCase() ?? '';
  return useQuery({
    queryKey: KEYS.leagues.byJoinCode(normalizedJoinCode),
    queryFn: () => leagueApi.findLeagueByJoinCode(normalizedJoinCode),
    enabled: normalizedJoinCode.length === 7,
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
      if (!userId) throw new Error('User not authenticated');

      const [leagueCheck, sizeCheck] = await Promise.all([
        canCreateLeague(userId),
        canCreateLeagueWithSize(userId, params.max_members),
      ]);

      if (!leagueCheck.allowed) throw new Error(leagueCheck.reason || 'Upgrade to Pro to create more leagues.');
      if (!sizeCheck.allowed) throw new Error(sizeCheck.reason || 'Upgrade to Pro for this league size.');

      return leagueApi.createLeague(params);
    },

    onSuccess: async (leagueId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: KEYS.users.leagues(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.members.primary(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.subscriptions.canCreateLeague(userId),
        }),
      ]);
      router.replace({
        pathname: '/(app)/(public)/myLeagues/preview-league',
        params: { leagueId },
      });
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });
};
export const useJoinLeague = () => {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ join_code, nickname }: { join_code: string; nickname: string }) => {
      if (!userId) throw new Error('User not authenticated');
      return leagueApi.joinLeague(join_code, nickname);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: KEYS.users.leagues(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.members.primary(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.subscriptions.canCreateLeague(userId),
        }),
      ]);
    },

    onError: (error) => {
      Alert.alert('Error', error.message);
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
      Alert.alert('Error', error.message);
    },
  });
};
export const useLeaveLeague = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? '');

  const initializeMember = useMemberStore((s) => s.initializeMember);
  return useMutation({
    mutationFn: async (leagueId: string) => {
      const result = await leagueApi.leaveLeague(leagueId);
      return result;
    },
    onSuccess: async (result, leagueId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: KEYS.users.leagues(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.members.primary(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.leagues.members(leagueId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.leagues.leaderboard(leagueId),
        }),
      ]);
      initializeMember();
      router.replace('/(app)/(public)/myLeagues');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });
};
export const useDeleteLeague = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const initializeMember = useMemberStore((s) => s.initializeMember);
  return useMutation({
    mutationFn: async ({ leagueId, ownerId }: { leagueId: string; ownerId: string }) => {
      if (!userId) throw new Error('User not authenticated');
      if (ownerId !== userId) {
        throw new Error('Only the league owner can delete this league');
      }
      return leagueApi.deleteLeague(leagueId);
    },
    onSuccess: async (_result, { leagueId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: KEYS.users.leagues(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.members.primary(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.leagues.detail(leagueId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.leagues.members(leagueId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.leagues.leaderboard(leagueId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.subscriptions.canCreateLeague(userId),
        }),
      ]);
      await initializeMember();
      router.replace('/(app)/(public)/myLeagues');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });
};
