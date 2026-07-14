import { KEYS } from '@/lib/queryClient';
import { useAuth } from '@/providers/AuthProvider';
import { useMemberStore, usePrimaryMember } from '@/store/MemberStore';
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
