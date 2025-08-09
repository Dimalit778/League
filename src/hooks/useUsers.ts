import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/usersService';
import { TablesInsert, TablesUpdate } from '@/types/database.types';
import useAuthStore from '@/store/useAuthStore';

const QUERY_KEYS = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  userLeagues: (id: string) => ['users', id, 'leagues'] as const,
  userPrimaryLeague: (id: string) => ['users', id, 'primaryLeague'] as const,
  userStats: (id: string) => ['users', id, 'stats'] as const,
  leagueMembers: (leagueId: number) => ['leagues', leagueId, 'members'] as const,
};

export const useUser = (userId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.user(userId!),
    queryFn: () => userService.getUserProfile(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useCurrentUser = () => {
  const { session } = useAuthStore();
  return useUser(session?.user?.id);
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { session } = useAuthStore();

  return useMutation({
    mutationFn: ({ updates }: { updates: TablesUpdate<'users'> }) =>
      userService.updateUserProfile(session?.user?.id!, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.user(session?.user?.id!), data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
    onError: (error) => {
      console.error('Failed to update user:', error);
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: TablesInsert<'users'>) => userService.createUserProfile(user),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.user(data.id), data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });
};

export const useUserLeagues = (userId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.userLeagues(userId!),
    queryFn: () => userService.getUserLeagues(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
    retry: 2,
  });
};

export const useCurrentUserLeagues = () => {
  const { session } = useAuthStore();
  return useUserLeagues(session?.user?.id);
};

export const useUserPrimaryLeague = (userId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.userPrimaryLeague(userId!),
    queryFn: () => userService.getUserPrimaryLeague(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
    retry: 2,
  });
};

export const useCurrentUserPrimaryLeague = () => {
  const { session } = useAuthStore();
  return useUserPrimaryLeague(session?.user?.id);
};

export const useLeagueMembers = (leagueId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.leagueMembers(leagueId),
    queryFn: () => userService.getLeagueMembers(leagueId),
    enabled: !!leagueId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

export const useUserStats = (userId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.userStats(userId!),
    queryFn: () => userService.getUserStats(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useCurrentUserStats = () => {
  const { session } = useAuthStore();
  return useUserStats(session?.user?.id);
};