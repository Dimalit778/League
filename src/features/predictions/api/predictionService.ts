import { supabase } from '@/lib/supabase';

export type PredictionInput = {
  league_member_id: string;
  match_id: number;
  home_score: number;
  away_score: number;
};

export const predictionService = {
  async upsertPrediction(prediction: PredictionInput) {
    const { data, error } = await supabase.rpc('upsert_own_prediction', {
      p_league_member_id: prediction.league_member_id,
      p_match_id: prediction.match_id,
      p_home_score: prediction.home_score,
      p_away_score: prediction.away_score,
    });

    if (error) throw error;
    return data;
  },
};
