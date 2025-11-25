import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { useMemberStore } from '@/store/MemberStore';
import { predictionService } from '../queries/predictionService';

import { downloadAndPrefetchAvatars } from '@/utils/downloadAndPrefetchAvatars';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Create Prediction
export const useCreatePrediction = () => {
  const queryClient = useQueryClient();
  const member = useMemberStore((state) => state.member);

  return useMutation({
    mutationFn: (prediction: { match_id: number; home_score: number; away_score: number }) => {
      if (!member?.user_id || !member?.id || !member?.league_id) {
        throw new Error('Member data is required to create prediction');
      }
      return predictionService.createPrediction({
        user_id: member.user_id,
        match_id: prediction.match_id,
        home_score: prediction.home_score,
        away_score: prediction.away_score,
        league_member_id: member.id,
        league_id: member.league_id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matches.all });
    },
    onError: (error) => {
      console.error('Failed to create prediction:', error);
    },
  });
};
export const useGetMyPredictionsView = (leagueId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.predictions.all,
    queryFn: () => predictionService.getMyPredictionsView(leagueId),
    enabled: !!leagueId,
  });
};
// Update Prediction
export const useUpdatePrediction = (memberId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prediction: { id: string; home_score: number; away_score: number }) => {
      if (!memberId) {
        throw new Error('User ID is required to update prediction');
      }
      return predictionService.updatePrediction({
        id: prediction.id,
        home_score: prediction.home_score,
        away_score: prediction.away_score,
        user_id: memberId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matches.all });
    },
    onError: (error) => {
      console.error('Failed to update prediction:', error);
    },
  });
};
export const useMemberPredictionsByRound = (round: string, memberId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.predictions.byUserAndMatchday(memberId || '', parseInt(round)),
    queryFn: () => {
      if (!memberId) {
        throw new Error('User ID is required to fetch predictions');
      }
      return predictionService.getMemberPredictionsByRound(memberId, round);
    },
    enabled: !!memberId && !!round,
  });
};

export const useMemberPredictions = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.predictions.byUser(userId),
    queryFn: () => predictionService.getMemberPredictions(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};
// Get User Prediction By Fixture
export const useMemberPredictionByFixture = (fixtureId: number, memberId: string, userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.predictions.byFixture(fixtureId),
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is required to fetch prediction');
      }
      return predictionService.getMemberPredictionByFixture(userId, fixtureId);
    },
    enabled: !!userId && !!fixtureId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
// Get League Predictions By Fixture
export const useGetLeaguePredictionsByFixture = (fixtureId: number, leagueId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.predictions.leagueByFixture(fixtureId, leagueId),
    queryFn: async () => {
      const rows = await predictionService.getLeaguePredictionsByFixture(fixtureId, leagueId);
      const paths = rows.map((r) => r.member.avatar_url).filter(Boolean) as string[];
      const imageUrls = await downloadAndPrefetchAvatars(paths);
      return rows.map((r) => ({
        ...r,
        member: {
          ...r.member,
          avatar_url: r.member.avatar_url ? (imageUrls.get(r.member.avatar_url) ?? null) : null,
        },
      }));
    },

    staleTime: 1000 * 60 * 5,
  });
};
