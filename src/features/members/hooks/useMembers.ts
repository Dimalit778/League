import { invalidateImageCache } from '@/hooks/useSupabaseImages';
import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { useMemberStore } from '@/store/MemberStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { memberApi } from '../api/membersApi';
export const useMemberStats = (memberId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.members.stats(memberId),
    queryFn: () => memberApi.getMemberStats(memberId),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  const leagueId = useMemberStore((s) => s.leagueId);
  const memberId = useMemberStore((s) => s.memberId);
  const initializeMember = useMemberStore((s) => s.initializeMember);

  return useMutation({
    mutationFn: (nickname: string) => {
      if (!memberId || !leagueId) {
        throw new Error('Member ID is required');
      }

      return memberApi.updateMember(memberId, nickname);
    },
    onSuccess: () => {
      if (!memberId || !leagueId) return;
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members.byId(memberId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members.stats(memberId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.leaderboard.byLeague(leagueId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.leagues.leagueAndMembers(leagueId),
      });

      initializeMember();
    },
    onError: (error) => {
      console.error('Failed to update member:', error);
    },
  });
};

export const useDeleteMemberImage = () => {
  const leagueId = useMemberStore((s) => s.leagueId);
  const memberId = useMemberStore((s) => s.memberId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (currentPath?: string | null) => {
      if (!leagueId || !memberId) {
        throw new Error('League ID and member ID are required');
      }
      return memberApi.deleteImage(memberId, currentPath ?? undefined);
    },
    onSuccess: (_, currentPath) => {
      if (!leagueId || !memberId) return;
      if (currentPath) {
        invalidateImageCache(currentPath);
      }
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
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.leaderboard.byLeague(leagueId),
      });
    },
  });
};

export const useUploadMemberImage = () => {
  const leagueId = useMemberStore((s) => s.leagueId);
  const memberId = useMemberStore((s) => s.memberId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (avatarUrl: ImagePicker.ImagePickerAsset) => {
      if (!leagueId || !memberId) {
        throw new Error('League ID and member ID are required');
      }
      return memberApi.uploadImage(leagueId, memberId, avatarUrl);
    },
    onSuccess: (data) => {
      if (!leagueId || !memberId) return;
      if (data?.avatar_url) {
        invalidateImageCache(data.avatar_url);
      }
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members.avatar(memberId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members.byId(memberId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members.stats(memberId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.leagues.leagueAndMembers(leagueId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.leaderboard.byLeague(leagueId),
      });
    },
  });
};

// --- new
export const useMemberPredictions = (memberId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.members.predictions(memberId),
    queryFn: () => {
      if (!memberId) {
        throw new Error('Member ID is required');
      }
      return memberApi.getMemberPredictions(memberId);
    },
    enabled: !!memberId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useMemberDataAndStats = (memberId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.members.dataAndStats(memberId),
    queryFn: () => {
      if (!memberId) {
        throw new Error('Member ID is required');
      }
      return memberApi.getMemberDataAndStats(memberId);
    },
    enabled: !!memberId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useMemberProfile = (memberId: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.members.byId(memberId), 'league'],
    queryFn: () => memberApi.getMemberProfile(memberId),
    enabled: !!memberId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
