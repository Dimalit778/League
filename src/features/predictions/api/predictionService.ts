import { supabase } from '@/lib/supabase';
import { TablesInsert } from '@/types/database.types';

export const predictionService = {
  async upsertPrediction(prediction: TablesInsert<'predictions'>) {
    const { data, error } = await supabase
      .from('predictions')
      .upsert(prediction, {
        onConflict: 'league_member_id,match_id',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
