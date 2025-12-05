import { KEYS } from '@/lib/queryClient';
import { userService } from '../queries/usersService';

import { useMemberStore } from '@/store/MemberStore';
import { TablesUpdate } from '@/types/database.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
export const useGetUser = () => {
  return useQuery({
    queryKey: KEYS.users.all,
    queryFn: () => userService.getUser(),
    retry: 2,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  const userId = useMemberStore((s) => s.userId) ?? '';
  return useMutation({
    mutationFn: ({ updates }: { updates: TablesUpdate<'users'> }) => {
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
      console.error('updateUser error', error);
    },
  });
};
