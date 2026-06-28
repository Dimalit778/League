import { KEYS } from '@/lib/queryClient';
import { userService } from '../queries/usersService';

import { useAuthStore } from '@/store/AuthStore';
import { TablesUpdate } from '@/types/database.types';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
export const useGetUser = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);

  return useQuery({
    queryKey: userId ? KEYS.users.detail(userId) : (['users', 'current', 'disabled'] as const),
    queryFn: !isAuthLoading && userId ? () => userService.getUser() : skipToken,
    retry: 2,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  const userId = useAuthStore((s) => s.user?.id) ?? null;
  return useMutation({
    mutationFn: ({ updates }: { updates: TablesUpdate<'users'> }) => {
      if (!userId) throw new Error('User ID is required');
      return userService.updateUserProfile(userId, updates);
    },
    onSuccess: (data) => {
      if (!userId) return;
      queryClient.setQueryData(KEYS.users.detail(userId), data);
      queryClient.invalidateQueries({
        queryKey: KEYS.users.detail(userId),
      });
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });
};
