import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { membersService } from '@/services/membersService';
import { useMemberStore } from '@/store/MemberStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useMemberStats = () => {
  const memberId = useMemberStore((s) => s.member?.id);

  return useQuery({
    queryKey: QUERY_KEYS.members.stats(memberId),
    queryFn: () => membersService.getMemberStats(memberId!),
    enabled: !!memberId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
export const useMemberImage = () => {
  const { member } = useMemberStore();
  const memberId = member?.id;
  return useQuery({
    queryKey: QUERY_KEYS.members.byId(memberId),
    queryFn: () => membersService.getMemberImage(memberId!),
    enabled: !!memberId,
  });
};
export const useDeleteMemberImage = () => {
  const { member } = useMemberStore();
  const queryClient = useQueryClient();
  const memberId = member?.id;
  return useMutation({
    mutationFn: () => {
      if (!memberId)
        throw new Error('Member id is required to delete member image');
      return membersService.deleteMemberImage(memberId);
    },
    mutationKey: QUERY_KEYS.members.byId(memberId),
    onSuccess: () => {
      if (!memberId) return;
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
export const useUploadMemberImage = () => {
  const { member } = useMemberStore();
  const queryClient = useQueryClient();
  const memberId = member?.id;
  return useMutation({
    mutationFn: (avatarUrl: string) => {
      if (!memberId) {
        throw new Error('Member id is required to upload member image');
      }
      return membersService.uploadMemberImage(memberId, avatarUrl);
    },
    onSuccess: () => {
      if (!memberId) return;
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members.byId(memberId),
      });
    },
    onError: (error) => {
      console.error('Failed to upload member image:', error);
    },
    mutationKey: memberId
      ? QUERY_KEYS.members.byId(memberId)
      : (['members', 'image', 'unknown'] as const),
    onSettled: () => {
      if (!memberId) return;
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members.byId(memberId),
      });
    },
  });
};
