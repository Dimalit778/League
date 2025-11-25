import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { useMemberStore } from '@/store/MemberStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { router } from 'expo-router';
import { Alert } from 'react-native';
import { leagueApi } from '../api/leagueApi';

export const useMyLeagues = (userId: string) => {
  return useQuery({
    queryKey: userId ? QUERY_KEYS.users.leagues(userId) : (['users', 'unknown', 'leagues'] as const),
    queryFn: () => leagueApi.getMyLeagues(userId),
    enabled: !!userId,
  });
};

export const useMyLeaguesView = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.users.leagues(userId),
    queryFn: () => leagueApi.getMyLeaguesView(userId),
    enabled: !!userId,
  });
};

export const useGetLeaderboard = (leagueId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.leaderboard.byLeague(leagueId),
    staleTime: 1000 * 60 * 5,
    queryFn: async () => await leagueApi.getLeaderboardView(leagueId),
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
            queryKey: QUERY_KEYS.leagues.leagueAndMembers(leagueId),
          }),
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.leaderboard.byLeague(leagueId),
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
    queryKey: leagueId ? QUERY_KEYS.leagues.byId(leagueId) : (['leagues', 'unknown', 'withCompetition'] as const),
    enabled: !!leagueId,
    staleTime: 1000 * 60 * 5,
    queryFn: () => leagueApi.getLeagueWithCompetition(leagueId!),
  });
};

export const useGetLeagueAndMembers = (leagueId?: string) => {
  return useQuery({
    queryKey: leagueId ? QUERY_KEYS.leagues.leagueAndMembers(leagueId) : (['leagues', 'unknown', 'full'] as const),
    enabled: !!leagueId,
    staleTime: 1000 * 60 * 5,
    queryFn: () => leagueApi.getLeagueAndMembers(leagueId!),
  });
};

export const useUpdatePrimaryLeague = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leagueId: string) => leagueApi.updatePrimaryLeague(userId, leagueId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.leagues(userId),
      });
    },
  });
};
//  -- LEAGUE OPERATIONS
export const useCreateLeague = (userId: string) => {
  const queryClient = useQueryClient();
  const { initializeMember } = useMemberStore();
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
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.leagues(userId),
      });
      await initializeMember();
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
export const useJoinLeague = (userId: string) => {
  const queryClient = useQueryClient();
  const { initializeMember } = useMemberStore();

  return useMutation({
    mutationFn: ({ join_code, nickname }: { join_code: string; nickname: string }) =>
      leagueApi.joinLeague(join_code, nickname),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.leagues(userId),
      });
      await initializeMember();
      console.log('joined league ------->,');
    },

    onError: (error) => {
      console.log('error ------->,', JSON.stringify(error));
      console.error('Failed to join league:', error);
    },
  });
};
export const useUpdateLeague = () => {
  const { initializeMember } = useMemberStore();
  const queryClient = useQueryClient();
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
          queryKey: QUERY_KEYS.leagues.byId(updated.id),
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.leagues.leagueAndMembers(updated.id),
        }),
      ]);
      await initializeMember();
    },
    onError: (error) => {
      console.error('Failed to update league:', error);
    },
  });
};
export const useLeaveLeague = () => {
  const queryClient = useQueryClient();
  const { initializeMember } = useMemberStore();

  return useMutation({
    mutationFn: async (leagueId: string) => {
      const result = await leagueApi.leaveLeague(leagueId);
      return result;
    },
    onSuccess: async (result, leagueId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.leaderboard.byLeague(leagueId),
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.leagues.leagueAndMembers(leagueId),
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
export const useFindLeagueByJoinCode = (joinCode: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.leagues.byJoinCode(joinCode),
    queryFn: () => leagueApi.findLeagueByJoinCode(joinCode),
    enabled: joinCode?.length === 7,
    retry: 1,
  });
};
