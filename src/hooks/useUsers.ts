import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { userService } from '@/services/usersService';
import { useStoreData } from '@/store/store';
import { TablesUpdate } from '@/types/database.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetUser = () => {
  return useQuery({
    queryKey: QUERY_KEYS.users.all,
    queryFn: () => userService.getUser(),
    retry: 2,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { member } = useStoreData();

  return useMutation({
    mutationFn: ({ updates }: { updates: TablesUpdate<'users'> }) => {
      if (!member?.user_id) {
        throw new Error('User id is required to update the profile');
      }
      return userService.updateUserProfile(member.user_id, updates);
    },
    onSuccess: (data) => {
      if (!member?.user_id) return;
      queryClient.setQueryData(QUERY_KEYS.users.byId(member.user_id), data);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.byId(member.user_id),
      });
    },
    onError: (error) => {
      console.error('Failed to update user:', error);
    },
  });
};
