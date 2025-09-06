import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { leagueService } from '@/services/leagueService';
import { useMemberStore } from '@/store/MemberStore';
import { createLeagueParams } from '@/types';
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
  const { createLeague } = useMemberStore();

  return useMutation({
    mutationFn: (params: createLeagueParams) =>
      createLeague(queryClient, userId, params),
    onSuccess: async (leagueId) => {
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
  const { joinLeague } = useMemberStore();

  return useMutation({
    mutationFn: ({
      join_code,
      nickname,
    }: {
      join_code: string;
      nickname: string;
    }) => joinLeague(queryClient, userId, join_code, nickname),

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
  const { updatePrimaryLeague } = useMemberStore();

  return useMutation({
    mutationFn: ({ leagueId }: { leagueId: string }) =>
      updatePrimaryLeague(queryClient, userId, leagueId),

    onError: (_, context) => {
      console.error('Failed to update primary league:', context);
    },
    onSuccess: async () => {
      router.push('/(app)/(tabs)/League');
      // Wait for any pending query invalidations to complete
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.leagues(userId),
        refetchType: 'active',
      });
    },
  });
};

// ********************************************************
export const useGetFullLeagueAndMembersById = (leagueId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.leagues.fullLeagueAndMembers(leagueId),
    queryFn: () => leagueService.getFullLeagueAndMembersById(leagueId),
    enabled: !!leagueId,
  });
};

// ********************************************************
export const useLeaveLeague = () => {
  const { session } = useCurrentSession();
  const userId = session?.user?.id as string;
  const queryClient = useQueryClient();
  const { leaveLeague } = useMemberStore();

  return useMutation({
    mutationFn: (leagueId: string) =>
      leaveLeague(queryClient, userId, leagueId),

    onError: (error) => {
      console.error('Failed to leave league:', error);
    },
  });
};
