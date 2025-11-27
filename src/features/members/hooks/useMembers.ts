import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { useMemberStore } from '@/store/MemberStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { memberApi } from '../api/membersApi';

// Constants
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const RETRY_COUNT = 2;

// Helper function to invalidate member-related queries
const invalidateMemberQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  memberId: string,
  leagueId?: string
) => {
  // Invalidate member-specific queries
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.members.byId(memberId) });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.members.stats(memberId) });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.members.dataAndStats(memberId) });

  // Invalidate league queries if leagueId is provided
  if (leagueId) {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leaderboard.byLeague(leagueId) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leagues.leagueAndMembers(leagueId) });
  }
};

export const useMemberStats = (memberId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.members.stats(memberId),
    queryFn: () => memberApi.getMemberStats(memberId),
    staleTime: STALE_TIME,
    retry: RETRY_COUNT,
  });
};
export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  const { leagueId, memberId, initializeMember } = useMemberStore();

  return useMutation({
    mutationFn: (nickname: string) => {
      if (!memberId || !leagueId) throw new Error('Member ID and League ID are required');
      return memberApi.updateMember(memberId, nickname);
    },
    onSuccess: () => {
      if (!memberId || !leagueId) return;
      invalidateMemberQueries(queryClient, memberId, leagueId);
      initializeMember();
    },
    onError: (error) => {
      console.error('Failed to update member:', error);
    },
  });
};

export const useDeleteMemberImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, currentPath }: { memberId: string; currentPath?: string | null }) => {
      return memberApi.deleteImage(memberId, currentPath);
    },
    onSuccess: (data) => {
      if (!data?.id) return;
      invalidateMemberQueries(queryClient, data.id, data.league_id);
    },
  });
};

export const useUploadMemberImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, avatarUrl }: { memberId: string; avatarUrl: ImagePicker.ImagePickerAsset }) => {
      return memberApi.uploadMemberImage(memberId, avatarUrl);
    },
    onSuccess: (data) => {
      if (!data?.id) return;
      invalidateMemberQueries(queryClient, data.id, data.league_id);
    },
  });
};

export const useMemberPredictions = (memberId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.members.predictions(memberId),
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
    queryKey: QUERY_KEYS.members.dataAndStats(memberId),
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
    queryKey: QUERY_KEYS.members.byId(memberId),
    queryFn: () => memberApi.getMemberProfile(memberId),
  });
};
