import { QUERY_KEYS } from '@/lib/queryKeys';
import { userService } from '@/services/usersService';
import { useMemberStore } from '@/store/MemberStore';
import { TablesUpdate } from '@/types/database.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';



export const useGetUser = () => {

  return useQuery({
    queryKey: ['user'],
    queryFn: () => userService.getUser(),
    retry: 2,
    staleTime: 60 * 1000, // 1 minute
  });
};



export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { member } = useMemberStore();

  return useMutation({
    mutationFn: ({ updates }: { updates: TablesUpdate<'users'> }) =>
      userService.updateUserProfile(member?.user_id!, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.user(member?.user_id!), data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(member?.user_id!) });
    },
    onError: (error) => {
      console.error('Failed to update user:', error);
    },
  });
};



//   return useQuery({
//     queryKey: QUERY_KEYS.userLeagues(userId!),
//     queryFn: () => userService.getUserLeagues(userId!),
//     enabled: !!userId,
//     staleTime: 60 * 1000, // 1 minute
//     retry: 2,
//   });
// };

// export const useCurrentUserLeagues = () => {
//   const { user } = useAuthStore();
//   return useUserLeagues(user?.id);
// };

// export const useUserPrimaryLeague = (userId?: string) => {
//   return useQuery({
//     queryKey: QUERY_KEYS.userPrimaryLeague(userId!),
//     queryFn: () => userService.getUserPrimaryLeague(userId!),
//     enabled: !!userId,
//     staleTime: 60 * 1000, // 1 minute
//     retry: 2,
//   });
// };

// export const useCurrentUserPrimaryLeague = () => {
//   const { user } = useAuthStore();
//   return useUserPrimaryLeague(user?.id);
// };

// export const useLeagueMembers = (leagueId: number) => {
//   return useQuery({
//     queryKey: QUERY_KEYS.leagueMembers(leagueId),
//     queryFn: () => userService.getLeagueMembers(leagueId),
//     enabled: !!leagueId,
//     staleTime: 2 * 60 * 1000, // 2 minutes
//     retry: 2,
//   });
// };

// export const useUserStats = (userId?: string) => {
//   return useQuery({
//     queryKey: QUERY_KEYS.userStats(userId!),
//     queryFn: () => userService.getUserStats(userId!),
//     enabled: !!userId,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     retry: 2,
//   });
// };

// export const useCurrentUserStats = () => {
//     const { user } = useAuthStore();
//   return useUserStats(user?.id);
// };