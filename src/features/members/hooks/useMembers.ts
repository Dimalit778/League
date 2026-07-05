import { KEYS } from '@/lib/queryClient';
import { useAuth } from '@/providers/AuthProvider';
import { useMemberStore, usePrimaryMember } from '@/store/MemberStore';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { memberApi } from '../api/memberApi';
import { memberImageApi } from '../api/memberImageApi';
import { memberStatsApi } from '../api/memberStatsApi';

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

export const useMemberStats = (memberId: string) => {
  return useQuery({
    queryKey: memberId ? KEYS.members.stats(memberId) : (['members', 'stats', 'disabled'] as const),
    queryFn: memberId ? () => memberStatsApi.getMemberStats(memberId) : skipToken,
    staleTime: STALE_TIME,
    retry: RETRY_COUNT,
  });
};
export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  const { memberId, leagueId } = usePrimaryMember();
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
        queryClient.invalidateQueries({ queryKey: KEYS.members.byId(memberId) });
      }
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });
};

export const useDeleteMemberImage = () => {
  const queryClient = useQueryClient();
  const setPrimaryMember = useMemberStore((s) => s.setPrimaryMember);
  return useMutation({
    mutationFn: ({ memberId, currentPath }: { memberId: string; currentPath?: string | null }) => {
      return memberImageApi.deleteImage(memberId, currentPath);
    },
    onSuccess: (data) => {
      invalidateMemberQueries(queryClient, data.id, data.league_id);
      const current = useMemberStore.getState().primaryMember;
      if (current) {
        setPrimaryMember({ ...current, avatarUrl: null });
      }
    },
  });
};

export const useUploadMemberImage = () => {
  const queryClient = useQueryClient();
  const setPrimaryMember = useMemberStore((s) => s.setPrimaryMember);
  return useMutation({
    mutationFn: ({ memberId, avatarUrl }: { memberId: string; avatarUrl: ImagePicker.ImagePickerAsset }) => {
      return memberImageApi.uploadImage(memberId, avatarUrl);
    },
    onSuccess: (data) => {
      const current = useMemberStore.getState().primaryMember;
      if (current) {
        setPrimaryMember({ ...current, avatarUrl: data.avatar_url });
      }
      invalidateMemberQueries(queryClient, data.id, data.league_id);
    },
  });
};


export const useMemberDataAndStats = (memberId: string) => {
  const memberQuery = useQuery({
    queryKey: memberId ? KEYS.members.detailsWithStats(memberId) : (['members', 'details-with-stats', 'disabled'] as const),
    queryFn: memberId ? () => memberApi.getMemberInfo(memberId) : skipToken,
    staleTime: STALE_TIME,
    retry: RETRY_COUNT,
  });

  const statsQuery = useMemberStats(memberId);

  const totalFixtures = Array.from(
    { length: memberQuery.data?.league?.competition?.current_fixture ?? 0 },
    (_, index) => index + 1,
  );

  return {
    ...memberQuery,
    isLoading: memberQuery.isLoading || statsQuery.isLoading,
    isPending: memberQuery.isPending || statsQuery.isPending,
    error: memberQuery.error ?? statsQuery.error,
    data:
      memberQuery.data != null
        ? {
            member: memberQuery.data,
            stats: statsQuery.data,
            totalFixtures,
            currentFixture: memberQuery.data.league?.competition?.current_fixture ?? 1,
          }
        : undefined,
  };
};  


export const useMyMemberByLeague = (leagueId: string) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  return useQuery({
    queryKey: userId ? KEYS.members.byLeague(userId, leagueId) : (['members', 'by-league', 'disabled'] as const),
    queryFn:  userId ? () => memberApi.getMyMemberByLeague(userId, leagueId) : skipToken,
    staleTime: STALE_TIME,
    retry: RETRY_COUNT,
  });
};  
