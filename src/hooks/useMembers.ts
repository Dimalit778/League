import { invalidateImageCache } from '@/hooks/useSupabaseImages';
import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { membersService } from '@/services/membersService';
import { useMemberStore } from '@/store/MemberStore';
import { useStoreData } from '@/store/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';

export const useMemberStats = (memberId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.members.stats(memberId),
    queryFn: () => membersService.getMemberStats(memberId),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  const { league, member } = useStoreData();
  const initializeMember = useMemberStore((s) => s.initializeMember);
  const memberId = member?.id;
  const leagueId = league?.id;

  return useMutation({
    mutationFn: (nickname: string) => {
      if (!memberId) {
        throw new Error('Member ID is required');
      }

      return membersService.updateMember(memberId, nickname);
    },
    onSuccess: () => {
      if (!memberId) return;
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
  const { member } = useStoreData();
  const leagueId = member?.league_id;
  const memberId = member?.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (currentPath?: string | null) => {
      if (!leagueId || !memberId) {
        throw new Error('League ID and member ID are required');
      }
      return membersService.deleteImage(memberId, currentPath ?? undefined);
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
  const { member } = useStoreData();
  const leagueId = member?.league_id;
  const memberId = member?.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (avatarUrl: ImagePicker.ImagePickerAsset) => {
      if (!leagueId || !memberId) {
        throw new Error('League ID and member ID are required');
      }
      return membersService.uploadImage(leagueId, memberId, avatarUrl);
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
      return membersService.getMemberPredictions(memberId);
    },
    enabled: !!memberId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useMemberStatsById = (memberId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.members.stats(memberId),
    queryFn: () => {
      return membersService.getMemberStats(memberId);
    },

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
      return membersService.getMemberDataAndStats(memberId);
    },
    enabled: !!memberId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useMemberLeague = (memberId: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.members.byId(memberId), 'league'],
    queryFn: () => {
      if (!memberId) {
        throw new Error('Member ID is required');
      }
      return membersService.getMemberLeague(memberId);
    },
    enabled: !!memberId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
