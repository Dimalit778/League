import { KEYS } from '@/lib/queryClient';
import { useMemberStore } from '@/store/MemberStore';
import { TablesInsert } from '@/types/database.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { predictionService } from '../queries/predictionService';
// Get Predictions by League Fixture
export const useGetPredictionsByLeagueFixture = (leagueId: string, fixture: number) => {
  return useQuery({
    queryKey: KEYS.predictions.byLeagueFixture(leagueId, fixture),
    queryFn: () => predictionService.getPredictionsByLeagueFixture(leagueId, fixture),
    enabled: !!leagueId && !!fixture,
  });
};
// Upsert Prediction (Create or Update)
export const useUpsertPrediction = () => {
  const queryClient = useQueryClient();
  const leagueId = useMemberStore((s) => s.leagueId) ?? '';
  const memberId = useMemberStore((s) => s.memberId) ?? '';
  return useMutation({
    mutationFn: (prediction: TablesInsert<'predictions'>) => {
      return predictionService.upsertPrediction(prediction);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: KEYS.predictions.byLeagueFixture(leagueId, data.match_id),
      });
      queryClient.invalidateQueries({
        queryKey: ['matches'],
        predicate: (query) => {
          const key = query.queryKey as any[];
          return key.includes(memberId);
        },
      });
      queryClient.invalidateQueries({
        queryKey: KEYS.matches.withPredictions(leagueId, data.match_id),
      });
    },
    onError: (error) => {
      console.error('Failed to save prediction:', error);
    },
  });
};

export const useMemberPredictions = (memberId: string) => {
  return useQuery({
    queryKey: KEYS.predictions.byMember(memberId),
    queryFn: () => predictionService.getMemberPredictionByFixture(memberId, 0),
    enabled: !!memberId,
    staleTime: 1000 * 60 * 5,
  });
};
