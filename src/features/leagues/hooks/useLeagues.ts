import { KEYS } from '@/lib/queryClient';

import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { leagueApi } from '@/features/leagues/api/leagueApi';
import { useEnsureProAccess } from '@/features/subscription/hooks/useEnsureProAccess';
import { useTranslation } from '@/hooks/useTranslation';
import { PLAN_LIMITS } from '@/lib/revenuecat/plans';
import { useAuth } from '@/providers/AuthProvider';
import { useAuthStore } from '@/store/AuthStore';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { leagueActionsApi } from '../api/leagueActionsApi';
import { LeagueSummary, MyLeague, MyLeaguesResponse } from '../types';

const STALE_TIME = 1000 * 60 * 5; // 5 minutes

export const useMyLeagues = () => {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: userId ? KEYS.users.leagues(userId) : (['users', 'leagues', 'disabled'] as const),
    queryFn: userId ? () => leagueApi.getMyLeagues(userId) : skipToken,
    staleTime: STALE_TIME,
  });
};


export const useGetLeaderboard = (leagueId: string) => {
  return useQuery({
    queryKey: KEYS.leagues.leaderboard(leagueId),
    queryFn: () => leagueApi.getLeaderboardView(leagueId),
    staleTime: 1000 * 60 * 5,
  });
};

// Per-round standings. Currently mirrors the season view (see leagueApi TODO);
// swap the queryFn's data source once a round leaderboard backend exists.
export const useGetRoundLeaderboard = (leagueId: string) => {
  return useQuery({
    queryKey: KEYS.leagues.roundLeaderboard(leagueId),
    queryFn: () => leagueApi.getRoundLeaderboardView(leagueId),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetCompetitionLeaderboard = (competitionId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: KEYS.competitions.leaderboard(competitionId),
    queryFn: () => leagueApi.getCompetitionLeaderboard(competitionId),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

export const useGetMyLeaguesSummary = () => {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: userId
      ? KEYS.users.leaguesSummary(userId)
      : (['users', 'leagues-summary', 'disabled'] as const),
    queryFn: userId ? () => leagueApi.getMyLeaguesSummary(userId) : skipToken,
    staleTime: 1000 * 60 * 5,
  });
};


export const useGetLeagueAndMembers = (leagueId?: string | null) => {
  return useQuery({
    queryKey: leagueId
      ? KEYS.leagues.members(leagueId)
      : (['leagues', 'unknown', 'full'] as const),
    queryFn: leagueId ? () => leagueApi.getLeagueAndMembers(leagueId) : skipToken,
    staleTime: STALE_TIME,
  });
};

export const useUpdatePrimaryLeague = () => {
  const { t } = useTranslation();
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async ({ leagueId }: { leagueId: string }) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return leagueApi.updatePrimaryLeague(leagueId);
    },

    onSuccess: async (_data, { leagueId }) => {
      if (!userId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: KEYS.leagues.leaderboard(leagueId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.members.primaryLeague(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.users.leagues(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.users.leaguesSummary(userId),
        }),
      ]);

    
    },

    onError: (error: Error) => {
      Alert.alert(t('Error'), error.message);
    },
  });
};

export const useUpdateLeagueActivation = ({
  reinitializePrimaryLeague = true,
}: { reinitializePrimaryLeague?: boolean } = {}) => {
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const initializePrimaryLeague = usePrimaryLeagueStore((s) => s.initializePrimaryLeague);

  return useMutation({
    mutationFn: (activeMemberIds: string[]) => {
      if (!userId) throw new Error('User not authenticated');
      return leagueApi.updateMyLeagueActivation(activeMemberIds);
    },
    onMutate: async (activeMemberIds) => {
      if (!userId) return undefined;

      const leaguesKey = KEYS.users.leagues(userId);
      const summaryKey = KEYS.users.leaguesSummary(userId);
      await Promise.all([
        queryClient.cancelQueries({ queryKey: leaguesKey }),
        queryClient.cancelQueries({ queryKey: summaryKey }),
      ]);

      const previousLeagues = queryClient.getQueryData<MyLeaguesResponse>(leaguesKey);
      const previousSummary = queryClient.getQueryData<LeagueSummary[]>(summaryKey);
      const activeIds = new Set(activeMemberIds);

      queryClient.setQueryData<MyLeaguesResponse>(leaguesKey, (current) => {
        if (!current) return current;

        const memberships = [
          ...(current.primaryLeague ? [current.primaryLeague] : []),
          ...current.leagues,
          ...current.inactiveLeagues,
        ].map((league) => ({ ...league, active: activeIds.has(league.id) }));

        return {
          primaryLeague: memberships.find((league) => league.is_primary) ?? null,
          leagues: memberships.filter((league) => !league.is_primary && league.active),
          inactiveLeagues: memberships.filter((league) => !league.is_primary && !league.active),
          total: memberships.length,
        };
      });
      queryClient.setQueryData<LeagueSummary[]>(summaryKey, (current) =>
        current?.map((league) => ({
          ...league,
          active: league.member_id ? activeIds.has(league.member_id) : league.active,
        })),
      );

      return { previousLeagues, previousSummary };
    },
    onSuccess: async () => {
      if (reinitializePrimaryLeague) await initializePrimaryLeague();
    },
    onError: (error, _activeMemberIds, context) => {
      if (userId && context) {
        queryClient.setQueryData(KEYS.users.leagues(userId), context.previousLeagues);
        queryClient.setQueryData(KEYS.users.leaguesSummary(userId), context.previousSummary);
      }
      Alert.alert(t('Error'), error.message);
    },
    onSettled: () => {
      if (!userId) return;

      void Promise.all([
        queryClient.invalidateQueries({ queryKey: KEYS.users.leagues(userId) }),
        queryClient.invalidateQueries({ queryKey: KEYS.users.leaguesSummary(userId) }),
        queryClient.invalidateQueries({ queryKey: KEYS.members.primaryLeague(userId) }),
      ]);
    },
  });
};

export const useReactivateLeaguesAfterProUpgrade = () => {
  const { ensureProAccess } = useEnsureProAccess();
  const { mutateAsync: updateLeagueActivation } = useUpdateLeagueActivation({ reinitializePrimaryLeague: false });

  return useCallback(
    async (leagues: MyLeague[]) => {
      try {
        const hasProAccess = await ensureProAccess();
        if (!hasProAccess) return false;

        const memberIds = leagues.map((league) => league.id).slice(0, PLAN_LIMITS.PRO.maxLeagues);
        if (memberIds.length === 0) return true;

        await updateLeagueActivation(memberIds);
        return true;
      } catch {
        // The mutation already displays a user-facing error through onError.
        // Swallow the rejected promise so button handlers do not emit Uncaught.
        return false;
      }
    },
    [ensureProAccess, updateLeagueActivation],
  );
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
  const initializePrimaryLeague = usePrimaryLeagueStore((state) => state.initializePrimaryLeague);
  const userId = useAuthStore((state) => state.user?.id );
  if (!userId) throw new Error('User not authenticated');
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
          queryKey: KEYS.users.leaguesSummary(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.members.primaryLeague(userId),
        }),
      ]);
      // RPC only returns leagueId; member row is is_primary — resolve full store context from DB
      await initializePrimaryLeague();
      router.replace({
        pathname: '/(app)/(user)/leagues/create-league/success',
        params: { leagueId },
      });
    },
  });
};
export const useJoinLeague = () => {
  const { t } = useTranslation();
  const userId = useAuthStore((state) => state.user?.id );
  if (!userId) throw new Error('User not authenticated');
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
          queryKey: KEYS.users.leaguesSummary(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.members.primaryLeague(userId),
        }),
      ]);
    },

    onError: (error) => {
      Alert.alert(t('Error'), error.message);
    },
  });
};
export const useUpdateLeague = () => {
  const { t } = useTranslation();
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
            queryKey: KEYS.members.primaryLeague(userId),
          }),
      ]);
    },
    onError: (error) => {
      Alert.alert(t('Error'), error.message);
    },
  });
};


export const useLeaveLeague = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? '');

  return useMutation({
    mutationFn: async (leagueId: string) => {
      const result = await leagueActionsApi.leaveLeague(leagueId);
      return result;
    },
    onSuccess: async (_result, leagueId) => {
      router.replace('/(app)/(league)/(tabs)');
      usePrimaryLeagueStore.getState().clearPrimaryLeague();
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: KEYS.users.leagues(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.users.leaguesSummary(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.members.primaryLeague(userId),
        }),
        queryClient.removeQueries({ queryKey: KEYS.leagues.members(leagueId) }),
        queryClient.removeQueries({ queryKey: KEYS.leagues.leaderboard(leagueId) }),
      ]);
      // Re-resolve the primary member: picks up a server-reassigned primary
      // league, or stays null when no leagues remain
        await usePrimaryLeagueStore.getState().initializePrimaryLeague();
    },
    onError: (error) => {
      Alert.alert(t('Error'), error.message);
    },
  });
};
export const useDeleteLeague = () => {
  const { t } = useTranslation();
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
      router.replace('/(app)/(league)/(tabs)');
      usePrimaryLeagueStore.getState().clearPrimaryLeague();
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: KEYS.users.leagues(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.users.leaguesSummary(userId),
        }),
        queryClient.invalidateQueries({
            queryKey: KEYS.members.primaryLeague(userId),
        }),
        queryClient.removeQueries({ queryKey: KEYS.leagues.detail(leagueId) }),
        queryClient.removeQueries({ queryKey: KEYS.leagues.members(leagueId) }),
        queryClient.removeQueries({ queryKey: KEYS.leagues.leaderboard(leagueId) }),
      ]);
      // Re-resolve the primary member: picks up a server-reassigned primary
      // league, or stays null when no leagues remain
        await usePrimaryLeagueStore.getState().initializePrimaryLeague();
    },
    onError: (error) => {
      Alert.alert(t('Error'), error.message);
    },
  });
};
