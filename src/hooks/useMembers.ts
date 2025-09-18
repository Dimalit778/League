import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { membersService } from '@/services/membersService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useMemberStats = (memberId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.members.stats(memberId),
    queryFn: () => membersService.getMemberStats(memberId!),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!memberId,
  });
};
export const useMemberImage = (memberId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.members.byId(memberId),
    queryFn: () => membersService.getMemberImage(memberId),
  });
};
export const useDeleteMemberImage = (memberId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => membersService.deleteMemberImage(memberId),
    mutationKey: QUERY_KEYS.members.byId(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members.byId(memberId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members.stats(memberId),
      });
    },
    onError: (error) => {
      console.error('Failed to delete member image:', error);
    },
  });
};
export const useUploadMemberImage = (memberId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (avatarUrl: string) =>
      membersService.uploadMemberImage(memberId, avatarUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members.byId(memberId),
      });
    },
    onError: (error) => {
      console.error('Failed to upload member image:', error);
    },
    mutationKey: QUERY_KEYS.members.byId(memberId),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members.byId(memberId),
      });
    },
  });
};
