import { KEYS } from '@/lib/queryClient';
import { useAuth } from '@/providers/AuthProvider';
import { useMemberStore } from '@/store/MemberStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useEffect } from 'react';
import { memberApi } from '../api/membersApi';

// Constants
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const RETRY_COUNT = 2;

const invalidateMemberQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  memberId: string,
  leagueId?: string
) => {
  queryClient.invalidateQueries({ queryKey: KEYS.members.byId(memberId) });
  queryClient.invalidateQueries({ queryKey: KEYS.members.stats(memberId) });
  if (leagueId) {
    queryClient.invalidateQueries({ queryKey: KEYS.leagues.leaderboard(leagueId) });
  }
};

export const useMemberStats = (memberId?: string) => {
  return useQuery({
    queryKey: KEYS.members.stats(memberId as string),
    queryFn: () => memberApi.getMemberStats(memberId as string),
    enabled: !!memberId,
    staleTime: STALE_TIME,
    retry: RETRY_COUNT,
  });
};
export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  const leagueId = useMemberStore((s) => s.leagueId);
  const memberId = useMemberStore((s) => s.memberId);
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
    onError: (error) => {},
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
    queryKey: KEYS.predictions.byMember(memberId as string),
    queryFn: () => {
      if (!memberId) throw new Error('Member ID is required');
      return memberApi.getMemberPredictions(memberId);
    },
    enabled: !!memberId,
    staleTime: STALE_TIME,
    retry: RETRY_COUNT,
  });
};

export const useMemberDataAndStats = (memberId: string) => {
  return useQuery({
    queryKey: KEYS.members.stats(memberId),
    queryFn: () => {
      if (!memberId) throw new Error('Member ID is required');
      return memberApi.getMemberDataAndStats(memberId);
    },
    enabled: !!memberId,
    staleTime: STALE_TIME,
    retry: RETRY_COUNT,
  });
};

export const useMemberProfile = (memberId: string) => {
  return useQuery({
    queryKey: KEYS.members.byId(memberId),
    queryFn: () => memberApi.getMemberProfile(memberId),
  });
};

export const usePrimaryMember = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const { setActiveMember } = useMemberStore();

  const query = useQuery({
    queryKey: KEYS.members.primary(userId as string),
    queryFn: async () => {
      if (!userId) return null;
      return memberApi.getPrimaryMember(userId);
    },
    enabled: !!userId,
    staleTime: STALE_TIME,
  });
  useEffect(() => {
    if (query.data !== undefined) {
      setActiveMember(query.data);
    }
  }, [query.data, setActiveMember]);

  return query;
};
