import { KEYS } from '@/lib/queryClient';
import { useAuth } from '@/providers/AuthProvider';
import { selectLeagueId, selectMemberId, useMemberStore } from '@/store/MemberStore';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { memberApi } from '../api/membersApi';

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

export const useMemberStats = (memberId?: string) => {
  return useQuery({
    queryKey: memberId ? KEYS.members.stats(memberId) : (['members', 'stats', 'disabled'] as const),
    queryFn: memberId ? () => memberApi.getMemberStats(memberId) : skipToken,
    staleTime: STALE_TIME,
    retry: RETRY_COUNT,
  });
};
export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  const leagueId = useMemberStore(selectLeagueId);
  const memberId = useMemberStore(selectMemberId);
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useMutation({
    mutationFn: (nickname: string) => {
      if (!memberId || !leagueId || !userId) throw new Error('Member ID, League ID and User ID are required');
      return memberApi.updateMember(memberId, nickname);
    },
    onSuccess: () => {
      if (!memberId || !leagueId) return;
      invalidateMemberQueries(queryClient, memberId, leagueId);
      if (userId) {
        queryClient.invalidateQueries({ queryKey: KEYS.members.primary(userId) });
      }
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });
};

export const useDeleteMemberImage = () => {
  const queryClient = useQueryClient();
  const { setActiveMember, activeMember } = useMemberStore();
  return useMutation({
    mutationFn: ({ memberId, currentPath }: { memberId: string; currentPath?: string | null }) => {
      return memberApi.deleteImage(memberId, currentPath);
    },
    onSuccess: (data) => {
      invalidateMemberQueries(queryClient, data.id, data.league_id);
      setActiveMember({ ...activeMember!, avatar_url: null });
    },
  });
};

export const useUploadMemberImage = () => {
  const queryClient = useQueryClient();
  const { setActiveMember, activeMember } = useMemberStore();
  return useMutation({
    mutationFn: ({ memberId, avatarUrl }: { memberId: string; avatarUrl: ImagePicker.ImagePickerAsset }) => {
      return memberApi.uploadMemberImage(memberId, avatarUrl);
    },
    onSuccess: (data) => {
      setActiveMember({ ...activeMember!, avatar_url: data.avatar_url });
      invalidateMemberQueries(queryClient, data.id, data.league_id);
    },
  });
};

export const useMemberPredictions = (memberId?: string) => {
  return useQuery({
    queryKey: memberId ? KEYS.predictions.byMember(memberId) : (['predictions', 'member', 'disabled'] as const),
    queryFn: memberId ? () => memberApi.getMemberPredictions(memberId) : skipToken,
    staleTime: STALE_TIME,
    retry: RETRY_COUNT,
  });
};

export const useMemberDataAndStats = (memberId: string | null) => {
  return useQuery({
    queryKey: memberId ? KEYS.members.detailsWithStats(memberId) : (['members', 'details-with-stats', 'disabled'] as const),
    queryFn: memberId ? () => memberApi.getMemberDataAndStats(memberId) : skipToken,
    staleTime: STALE_TIME,
    retry: RETRY_COUNT,
  });
};

export const useMemberProfile = (memberId: string | null) => {
  return useQuery({
    queryKey: memberId ? KEYS.members.byId(memberId) : (['members', 'profile', 'disabled'] as const),
    queryFn: memberId ? () => memberApi.getMemberProfile(memberId) : skipToken,
  });
};

export const usePrimaryMember = () => {
  const { user, isAuthLoading } = useAuth();
  const userId = user?.id ?? null;
  const { setActiveMember } = useMemberStore();

  const query = useQuery({
    queryKey: userId ? KEYS.members.primary(userId) : (['members', 'primary', 'disabled'] as const),
    queryFn: !isAuthLoading && userId ? () => memberApi.getPrimaryMember(userId) : skipToken,
    staleTime: STALE_TIME,
    retry: RETRY_COUNT,
  });

  useEffect(() => {
    if (query.isSuccess) {
      setActiveMember(query.data ?? null);
    }
  }, [query.isSuccess, query.data, setActiveMember]);

  return query;
};
