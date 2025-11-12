import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { leagueService } from '@/services/leagueService';
import { useMemberStore } from '@/store/MemberStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useCurrentSession } from './useCurrentSession';
import { downloadMultipleImages } from './useSupabaseImages';

/**
 * Helper function to download and prefetch avatar images
 * @param avatarPaths Array of avatar paths from Supabase storage
 * @returns Map of original path to signed URL
 */
async function downloadAndPrefetchAvatars(
  avatarPaths: string[]
): Promise<Map<string, string | null>> {
  if (avatarPaths.length === 0) {
    return new Map();
  }

  const imageUrls = await downloadMultipleImages(avatarPaths, {
    bucket: 'avatars',
  });

  const validUrls = Array.from(imageUrls.values()).filter(
    (url): url is string => url !== null
  );

  if (validUrls.length > 0) {
    await Promise.all(
      validUrls.map((url) =>
        Image.prefetch(url, { cachePolicy: 'memory-disk' }).catch(() => {})
      )
    );
  }

  return imageUrls;
}
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
  const { initializeMember } = useMemberStore();

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
    queryFn: () => leagueService.findLeagueByJoinCode(joinCode),
    enabled: joinCode?.length === 7,
    retry: 1,
  });
};

export const useGetLeagueLeaderboard = (leagueId?: string) => {
  return useQuery({
    queryKey: leagueId
      ? QUERY_KEYS.leaderboard.byLeague(leagueId)
      : (['leaderboard', 'unknown'] as const),
    enabled: !!leagueId,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      if (!leagueId) {
        throw new Error('League id is required to fetch leaderboard');
      }
      const rows = await leagueService.getLeagueLeaderboard(leagueId);

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
    mutationFn: leagueService.leaveLeague,
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
    queryKey: leagueId
      ? QUERY_KEYS.leagues.leagueAndMembers(leagueId)
      : (['leagues', 'unknown', 'full'] as const),
    enabled: !!leagueId,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      if (!leagueId) {
        throw new Error('League id is required to fetch league and members');
      }
      const rows = await leagueService.getLeagueAndMembers(leagueId);

      const paths = rows.league_members
        .map((r) => r.avatar_url)
        .filter(Boolean) as string[];
      const imageUrls = await downloadAndPrefetchAvatars(paths);

      return {
        ...rows,
        league_members: rows.league_members.map((r) => ({
          ...r,
          avatar_url: r.avatar_url
            ? (imageUrls.get(r.avatar_url) ?? null)
            : null,
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
      return leagueService.updateLeague(leagueId, { name });
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
  const { initializeMember } = useMemberStore();
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
      await initializeMember();
    },
    onError: (error) => {
      console.error('Failed to create league:', error);
    },
  });
};
