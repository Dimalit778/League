import { KEYS } from '@/lib/queryClient';

import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { leagueApi } from '@/features/leagues/api/leagueApi';
import { memberApi } from '@/features/members/api/memberApi';
import { useAuth } from '@/providers/AuthProvider';
import { useAuthStore } from '@/store/AuthStore';
import { useMemberStore } from '@/store/MemberStore';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { leagueActionsApi } from '../api/leagueActionsApi';
  export const useMyLeagues = () => {
  
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useQuery({
    queryKey: userId ? KEYS.users.leagues(userId) : (['users', 'leagues', 'disabled'] as const),
    queryFn: userId ? () => leagueApi.getMyLeagues(userId) : skipToken,
  });
};


export const useGetLeaderboard = (leagueId?: string | null) => {
  return useQuery({
    queryKey: leagueId ? KEYS.leagues.leaderboard(leagueId) : (['leagues', 'leaderboard', 'disabled'] as const),
    queryFn: leagueId ? () => leagueApi.getLeaderboardView(leagueId) : skipToken,
    enabled: !!leagueId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useMemberLeagueSummary = (memberId?: string | null) => {
  return useQuery({
    queryKey: memberId ? KEYS.members.summary(memberId) : (['members', 'summary', 'disabled'] as const),
    queryFn: memberId ? () => leagueApi.getMemberLeagueSummary(memberId) : skipToken,
    enabled: !!memberId,
    staleTime: 1000 * 60 * 5,
  });
};


export const useGetLeagueAndMembers = (leagueId?: string | null) => {
  return useQuery({
    queryKey: leagueId
      ? KEYS.leagues.members(leagueId)
      : (['leagues', 'unknown', 'full'] as const),
    queryFn: leagueId ? () => leagueApi.getLeagueAndMembers(leagueId) : skipToken,
  });
};

export const useUpdatePrimaryLeague = () => {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const queryClient = useQueryClient();
  const initializeMember = useMemberStore((s) => s.initializeMember);
  return useMutation({
    mutationFn: ({ leagueId }: { leagueId: string }) =>
      leagueApi.updatePrimaryLeague(leagueId),
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

export const useUpdateLeagueActivation = () => {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const queryClient = useQueryClient();
  const initializeMember = useMemberStore((s) => s.initializeMember);

  return useMutation({
    mutationFn: (activeMemberIds: string[]) => {
      if (!userId) throw new Error('User not authenticated');
      return leagueApi.updateMyLeagueActivation(userId, activeMemberIds);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: KEYS.users.leagues(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.members.primary(userId),
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
  const canSearch = normalizedJoinCode.length === 7;
  return useQuery({
    queryKey: KEYS.leagues.byJoinCode(normalizedJoinCode),
    queryFn: canSearch ? () => leagueApi.findLeagueByJoinCode(normalizedJoinCode) : skipToken,
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
      return leagueActionsApi.createLeague(params);
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
        pathname: '/(app)/(user)/leagues/create-league/success',
        params: { leagueId },
      });
    },
  });
};
export const useJoinLeague = () => {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      join_code,
      nickname,
    }: {
      join_code: string;
      nickname: string;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      return leagueActionsApi.joinLeague(join_code, nickname);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: KEYS.users.leagues(userId),
        }),
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
export const useUpdateLeague = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  return useMutation({
    mutationFn: ({ leagueId, name }: { leagueId?: string; name?: string }) => {
      if (!leagueId) {
        throw new Error('League id is required to update league');
      }
      return leagueActionsApi.updateLeague(leagueId, { name });
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
export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? '');

  return useMutation({
    mutationFn: (memberId: string) => memberApi.removeMember(memberId),
    onSuccess: async ({ leagueId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: KEYS.leagues.members(leagueId) }),
        queryClient.invalidateQueries({ queryKey: KEYS.leagues.leaderboard(leagueId) }),
        queryClient.invalidateQueries({ queryKey: KEYS.users.leagues(userId) }),
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

  return useMutation({
    mutationFn: async (leagueId: string) => {
      const result = await leagueActionsApi.leaveLeague(leagueId);
      return result;
    },
    onSuccess: async (_result, leagueId) => {
      router.replace('/(app)/(user)');
      useMemberStore.getState().clearMember();
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: KEYS.users.leagues(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.members.primary(userId),
        }),
        queryClient.removeQueries({ queryKey: KEYS.leagues.members(leagueId) }),
        queryClient.removeQueries({ queryKey: KEYS.leagues.leaderboard(leagueId) }),
      ]);
      // Re-resolve the primary member: picks up a server-reassigned primary
      // league, or stays null when no leagues remain
      await useMemberStore.getState().initializeMember();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });
};
export const useDeleteLeague = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? '');
  return useMutation({
    mutationFn: async ({
      leagueId,
      ownerId,
    }: {
      leagueId: string;
      ownerId: string;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      if (ownerId !== userId) {
        throw new Error('Only the league owner can delete this league');
      }
      return leagueActionsApi.deleteLeague(leagueId);
    },
    onSuccess: async (_result, { leagueId }) => {
      router.replace('/(app)/(user)');
      useMemberStore.getState().clearMember();
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: KEYS.users.leagues(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.members.primary(userId),
        }),
        queryClient.removeQueries({ queryKey: KEYS.leagues.detail(leagueId) }),
        queryClient.removeQueries({ queryKey: KEYS.leagues.members(leagueId) }),
        queryClient.removeQueries({ queryKey: KEYS.leagues.leaderboard(leagueId) }),
      ]);
      // Re-resolve the primary member: picks up a server-reassigned primary
      // league, or stays null when no leagues remain
      await useMemberStore.getState().initializeMember();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });
};
