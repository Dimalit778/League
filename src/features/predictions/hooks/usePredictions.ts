import { KEYS } from '@/lib/queryClient';
import { selectCompetitionId, selectLeagueId, selectMemberId, useMemberStore } from '@/store/MemberStore';
import { TablesInsert } from '@/types/database.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { predictionService } from '../api/predictionService';

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
      if (leagueId) {
        queryClient.invalidateQueries({
          queryKey: KEYS.predictions.byLeague(leagueId),
        });
      }

      if (competitionId) {
        queryClient.invalidateQueries({
          queryKey: KEYS.matches.byCompetitionRoot(competitionId),
        });
      }

      if (competitionId && memberId) {
        queryClient.invalidateQueries({
          queryKey: KEYS.matches.byCompetition(competitionId, memberId),
        });
      }

      if (leagueId) {
        queryClient.invalidateQueries({
          queryKey: KEYS.matches.withPredictions(leagueId, data.match_id),
        });
      }
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });
};
