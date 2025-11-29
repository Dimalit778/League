import { KEYS } from '@/lib/queryClient';
import { userService } from '../queries/usersService';

import { useQuery } from '@tanstack/react-query';

export const useGetUser = () => {
  return useQuery({
    queryKey: KEYS.users.all,
    queryFn: () => userService.getUser(),
    retry: 2,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useUpdateUser = () => {
  //   const queryClient = useQueryClient();
  //   const userId =
  //  const memberId = useMemberStore((s) => s.memberId);
  //   return useMutation({
  //     mutationFn: ({ updates }: { updates: TablesUpdate<'users'> }) => {
  //       if (!member?.user_id) {
  //         throw new Error('User id is required to update the profile');
  //       }
  //       return userService.updateUserProfile(member.user_id, updates);
  //     },
  //     onSuccess: (data) => {
  //       if (!member?.user_id) return;
  //       queryClient.setQueryData(KEYS.users.byId(member.user_id), data);
  //       queryClient.invalidateQueries({
  //         queryKey: KEYS.users.byId(member.user_id),
  //       });
  //     },
  //     onError: (error) => {
  //       console.error('Failed to update user:', error);
  //     },
  //   });
};
