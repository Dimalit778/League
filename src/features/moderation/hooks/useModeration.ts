import { KEYS } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moderationApi } from '../api/moderationApi';
import { useAuthStore } from '@/store/AuthStore';

const invalidateVisibleContent = (queryClient: ReturnType<typeof useQueryClient>) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: KEYS.members.all }),
    queryClient.invalidateQueries({ queryKey: KEYS.leagues.all }),
    queryClient.invalidateQueries({ queryKey: KEYS.predictions.all }),
    queryClient.invalidateQueries({ queryKey: KEYS.competitions.all }),
  ]);

export const useSubmitContentReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moderationApi.submitReport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.moderation.myReports }),
  });
};

export const useBlockedUsers = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: KEYS.moderation.blockedUsers,
    queryFn: moderationApi.getBlockedUsers,
    enabled: !!userId,
  });
};

export const useBlockStatus = (targetUserId?: string | null) =>
  useQuery({
    queryKey: KEYS.moderation.blockStatus(targetUserId),
    queryFn: () => moderationApi.isUserBlocked(targetUserId!),
    enabled: !!targetUserId,
  });

export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moderationApi.blockUser,
    onSuccess: async (_data, targetUserId) => {
      queryClient.setQueryData(KEYS.moderation.blockStatus(targetUserId), true);
      await queryClient.invalidateQueries({ queryKey: KEYS.moderation.blockedUsers });
      await invalidateVisibleContent(queryClient);
    },
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moderationApi.unblockUser,
    onSuccess: async (_data, targetUserId) => {
      queryClient.setQueryData(KEYS.moderation.blockStatus(targetUserId), false);
      await queryClient.invalidateQueries({ queryKey: KEYS.moderation.blockedUsers });
      await invalidateVisibleContent(queryClient);
    },
  });
};
