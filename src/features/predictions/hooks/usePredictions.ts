import { MatchCardType } from '@/features/matches/types';
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
      Alert.alert('Error', error.message);
    },
  });
};
