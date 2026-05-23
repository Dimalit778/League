import { KEYS } from '@/lib/queryClient';
import { selectCompetitionId, selectLeagueId, selectMemberId, useMemberStore } from '@/store/MemberStore';
import { TablesInsert } from '@/types/database.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { predictionService } from '../api/predictionService';
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
  const competitionId = useMemberStore(selectCompetitionId) ?? 0;
  const leagueId = useMemberStore(selectLeagueId) ?? '';
  const memberId = useMemberStore(selectMemberId) ?? '';
  return useMutation({
    mutationFn: (prediction: TablesInsert<'predictions'>) => {
      return predictionService.upsertPrediction(prediction);
    },
    onSuccess: (data) => {
      // Invalidate all predictions queries for the league
      queryClient.invalidateQueries({
        queryKey: ['predictions', 'league', leagueId],
      });

      // Invalidate competition matches for this member so the list reflects the new prediction
      queryClient.invalidateQueries({
        queryKey: KEYS.matches.byCompetition(competitionId, memberId),
      });

      // Invalidate specific match detail with predictions
      queryClient.invalidateQueries({
        queryKey: KEYS.matches.withPredictions(leagueId, data.match_id),
      });

      // Invalidate match detail
      queryClient.invalidateQueries({
        queryKey: KEYS.matches.detail(data.match_id),
      });
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
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
