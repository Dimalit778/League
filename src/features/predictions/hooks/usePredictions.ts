import { MatchCardType } from '@/features/matches/types';
import { useTranslation } from '@/hooks/useTranslation';
import { KEYS } from '@/lib/queryClient';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { PredictionInput, predictionService } from '../api/predictionService';

export const useUpsertPrediction = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const competitionId = usePrimaryLeagueStore((s) => s.competitionId) ?? 0;
  const leagueId = usePrimaryLeagueStore((s) => s.leagueId) ?? '';
  const memberId = usePrimaryLeagueStore((s) => s.memberId) ?? '';
  return useMutation({
    mutationFn: (prediction: PredictionInput) => {
      return predictionService.upsertPrediction(prediction);
    },
    onSuccess: (data) => {
      if (competitionId && memberId) {
        queryClient.setQueriesData<MatchCardType[]>(
          { queryKey: ['matches', competitionId] },
          (old) => {
            if (!old) return old;

            return old.map((match) =>
              match.id === data.match_id ? { ...match, prediction: data } : match,
            );
          },
        );
      }

      if (leagueId) {
        queryClient.invalidateQueries({
          queryKey: KEYS.matches.withPredictions(leagueId, data.match_id),
        });
      }
    },
    onError: (error) => {
      Alert.alert(t('Error'), error.message);
    },
  });
};
