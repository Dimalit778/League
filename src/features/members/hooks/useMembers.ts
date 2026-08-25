import { disabledKey, KEYS } from '@/lib/queryClient';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/providers/AuthProvider';
import { useAuthStore } from '@/store/AuthStore';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { memberApi } from '../api/memberApi';
import { memberImageApi } from '../api/memberImageApi';

// Constants
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const RETRY_COUNT = 2;

const invalidateMemberQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  memberId: string,
  leagueId?: string,
) => {
  queryClient.invalidateQueries({ queryKey: KEYS.members.byId(memberId) });
  queryClient.invalidateQueries({ queryKey: KEYS.members.stats(memberId) });
  queryClient.invalidateQueries({ queryKey: KEYS.members.detailsWithStats(memberId) });
  if (leagueId) {
    queryClient.invalidateQueries({ queryKey: KEYS.leagues.leaderboard(leagueId) });
  }
};

export const useGetMember = (memberId: string) => {
  return useQuery({
    queryKey: KEYS.members.byId(memberId),
    queryFn: async () => {
      return memberApi.getMember(memberId);
    },
    staleTime: STALE_TIME,
    retry: RETRY_COUNT,
    enabled: !!memberId,
  });
};

export const useUpdateMember = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const memberId = usePrimaryLeagueStore((s) => s.memberId);

  return useMutation({
    mutationFn: (nickname: string) => {
      if (!memberId) throw new Error('Member ID is required');
      return memberApi.updateMember(memberId, nickname);
    },
    onSuccess: (data) => {
      if (!memberId) return;
      invalidateMemberQueries(queryClient, memberId);
      if (data.id === memberId) {
        usePrimaryLeagueStore.getState().patchPrimaryMember({ nickname: data.nickname });
      }
    },
    onError: (error) => {
      Alert.alert(t('Error'), error.message);
    },
  });
};

export const useDeleteMemberImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, currentPath }: { memberId: string; currentPath?: string | null }) => {
      return memberImageApi.deleteImage(memberId, currentPath);
    },
    onSuccess: (data) => {
      invalidateMemberQueries(queryClient, data.id, data.league_id);
      if (usePrimaryLeagueStore.getState().memberId === data.id) {
        usePrimaryLeagueStore.getState().patchPrimaryMember({ avatarUrl: data.avatar_url });
      }
    },
  });
};

export const useUploadMemberImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, avatarUrl }: { memberId: string; avatarUrl: ImagePicker.ImagePickerAsset }) => {
      return memberImageApi.uploadImage(memberId, avatarUrl);
    },
    onSuccess: (data) => {
      invalidateMemberQueries(queryClient, data.id, data.league_id);
      if (usePrimaryLeagueStore.getState().memberId === data.id) {
        usePrimaryLeagueStore.getState().patchPrimaryMember({ avatarUrl: data.avatar_url });
      }
    },
  });
};

export const useMyMemberByLeague = (leagueId: string) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  return useQuery({
    queryKey: userId ? KEYS.members.byLeague(userId, leagueId) : disabledKey('members', 'by-league'),
    queryFn: userId ? () => memberApi.getMyMemberByLeague(userId, leagueId) : skipToken,
    staleTime: STALE_TIME,
    retry: RETRY_COUNT,
  });
};

export const useRemoveMember = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? '');

  return useMutation({
    mutationFn: (memberId: string) => memberApi.removeMember(memberId),
    onSuccess: async ({ leagueId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: KEYS.leagues.members(leagueId) }),
        queryClient.invalidateQueries({ queryKey: KEYS.leagues.leaderboard(leagueId) }),
        queryClient.invalidateQueries({ queryKey: KEYS.users.leagues(userId) }),
      ]);
    },
    onError: (error) => {
      Alert.alert(t('Error'), error.message);
    },
  });
};
