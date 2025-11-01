import { QUERY_KEYS, TOKENS } from '@/lib/tanstack/keys';
import { membersService } from '@/services/membersService';
import { useMemberStore } from '@/store/MemberStore';
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
export const useUpdateMember = (memberId?: string) => {
  if (!memberId) {
    throw new Error('Member ID is required');
  }
  const queryClient = useQueryClient();
  const initializeMemberLeagues = useMemberStore(
    (state) => state.initializeMemberLeagues
  );

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
      // Also invalidate league queries to update member data in league context
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.leagues.all,
      });
      // Refresh the member store with latest data
      initializeMemberLeagues();
    },
  });
};

export const useDeleteMemberImage = (leagueId: string, memberId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (currentPath?: string | null) =>
      membersService.removeAvatar(leagueId, memberId, currentPath ?? undefined),
    mutationKey: QUERY_KEYS.members.byId(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members.byId(memberId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members.stats(memberId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members.avatar(memberId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.leagues.leagueAndMembers(leagueId),
      });
    },
    onError: (error) => {
      console.error('Failed to delete member image:', error);
    },
  });
};
export const useMemberAvatar = (
  memberId?: string,
  path?: string | null,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    resize?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    expiresIn?: number;
  }
) => {
  const avatarKey = [
    ...QUERY_KEYS.members.avatar(memberId),
    path ?? TOKENS.pending,
  ] as const;

  return useQuery({
    queryKey: avatarKey,
    queryFn: () => membersService.getMemberAvatar(path!, options),
    staleTime: 5 * 60 * 1000,
    enabled: !!path,
  });
};
export const useUploadMemberImage = (leagueId?: string, memberId?: string) => {
  if (!leagueId || !memberId) {
    throw new Error('League ID and member ID are required');
  }
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (avatarUrl: ImagePicker.ImagePickerAsset) =>
      membersService.uploadAvatarImage(leagueId, memberId, avatarUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members.avatar(memberId),
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members.byId(memberId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.leagues.leagueAndMembers(leagueId),
      });
    },
  });
};
