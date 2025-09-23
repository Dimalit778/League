import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { membersService } from '@/services/membersService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';

export const useMemberStats = (memberId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.members.stats(memberId),
    queryFn: () => membersService.getMemberStats(memberId!),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!memberId,
  });
};
export const useUpdateMember = (memberId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nickname: string) =>
      membersService.updateMember(memberId, nickname),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members.byId(memberId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members.stats(memberId),
      });
    },
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
export const useMemberAvatar = (path: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.members.byId(path),
    queryFn: () => membersService.getMemberAvatar(path),
    enabled: !!path,
  });
};
export const useUploadMemberImage = (leagueId: string, memberId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (avatarUrl: ImagePicker.ImagePickerAsset) =>
      membersService.uploadAvatarImage(leagueId, memberId, avatarUrl),
    onSuccess: () => {
      // Invalidate both image and avatar queries
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.members.byId(memberId), 'image'],
      });
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.members.byId(memberId), 'avatar'],
      });
      // Also invalidate the general member query
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members.byId(memberId),
      });
    },
  });
};
