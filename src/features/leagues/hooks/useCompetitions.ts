import { supabase } from '@/lib/supabase/supabase';
import { queryKeys } from '@/lib/tanstack-query/keys';
import { useQuery } from '@tanstack/react-query';
import { Competition } from '../types/competition.types';

export const useCompetitionRounds = (competitionId: number) => {
  return useQuery({
    queryKey: ['competition-rounds', competitionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("competitions")
        .select("id, name, rounds_data, current_round, season")
        .eq("id", competitionId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        rounds: data.rounds_data?.rounds || [],
        currentRound: data.current_round,
        totalRounds: data.rounds_data?.total_rounds || 0,
        lastSynced: data.rounds_data?.synced_at,
        season: data.season
      };
    },
    staleTime: 10 * 60 * 60 * 1000, // 10 hours
  });
};
export const useCompetitions = () => {
  return useQuery({
    queryKey: queryKeys.competitions,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Competition[];
    },
  });
};
