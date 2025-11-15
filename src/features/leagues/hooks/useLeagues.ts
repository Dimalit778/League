import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { useMemberStore } from '@/store/MemberStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useCurrentSession } from '@/features/auth/hooks/useCurrentSession';
import { downloadAndPrefetchAvatars } from '@/utils/downloadAndPrefetchAvatars';
import { leagueApi } from '../api/leagueApi';

export const useMyLeagues = (userId: string) => {
  return useQuery({
    queryKey: userId ? QUERY_KEYS.users.leagues(userId) : (['users', 'unknown', 'leagues'] as const),
    queryFn: () => leagueApi.getMyLeagues(userId),
    enabled: !!userId,
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
    },

    onError: (error) => {
      console.error('Failed to join league:', error);
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

export const useGetLeaderboard = (leagueId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.leaderboard.byLeague(leagueId),
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const rows = await leagueApi.getLeaderboardView(leagueId);

      const paths = rows.map((r) => r.avatar_url).filter(Boolean) as string[];
      const imageUrls = await downloadAndPrefetchAvatars(paths);

      return rows.map((r) => ({
        ...r,
        avatar_url: r.avatar_url ? (imageUrls.get(r.avatar_url) ?? null) : null,
      }));
    },
  });
};
export const useLeaveLeague = () => {
  const { session } = useCurrentSession();
  const userId = session?.user?.id as string;
  const queryClient = useQueryClient();
  const { initializeMember } = useMemberStore();

  return useMutation({
    mutationFn: leagueApi.leaveLeague,
    onSuccess: async () => {
      // First invalidate queries to get fresh data
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.leagues(userId),
      });

      // Then initialize member leagues which will set member to null if no leagues
      await initializeMember();
    },
  });
};

export const useGetLeagueAndMembers = (leagueId?: string) => {
  return useQuery({
    queryKey: leagueId ? QUERY_KEYS.leagues.leagueAndMembers(leagueId) : (['leagues', 'unknown', 'full'] as const),
    enabled: !!leagueId,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      if (!leagueId) {
        throw new Error('League id is required to fetch league and members');
      }
      const rows = await leagueApi.getLeagueAndMembers(leagueId);

      const paths = rows.league_members.map((r) => r.avatar_url).filter(Boolean) as string[];
      const imageUrls = await downloadAndPrefetchAvatars(paths);

      return {
        ...rows,
        league_members: rows.league_members.map((r) => ({
          ...r,
          avatar_url: r.avatar_url ? (imageUrls.get(r.avatar_url) ?? null) : null,
        })),
      };
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

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leagueId, userId }: { leagueId: string; userId: string }) =>
      leagueApi.removeMember(leagueId, userId),

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
  const { initializeMember } = useMemberStore();
  return useMutation({
    mutationFn: (params: {
      league_name: string;
      nickname: string;
      competition_id: number;
      max_members: number;
      user_id: string;
    }) => leagueApi.createLeague(params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.leagues(userId),
      });
      await initializeMember();
    },
    onError: (error) => {
      console.error('Failed to create league:', error);
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
