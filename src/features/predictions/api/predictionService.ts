import { supabase } from '@/lib/supabase';
import { TablesInsert } from '@/types/database.types';

export const predictionService = {
 
  // Get Predictions by League Fixture
  // async getPredictionsByLeagueFixture(leagueId: string, fixture: number) {
  //   const { data, error } = await supabase
  //     .from('my_predictions_view')
  //     .select('*')
  //     .eq('league_id', leagueId)
  //     .eq('fixture', fixture)
  //     .order('prediction_created_at', { ascending: false });

  //   if (error) throw error;
  //   return data;
  // },

  // Upsert Prediction (Create or Update)
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

  // // Get Member Prediction by Fixture
  // async getMemberPredictionByFixture(memberId: string, fixtureId: number) {
  //   const { data, error } = await supabase
  //     .from('predictions')
  //     .select('*')
  //     .eq('league_member_id', memberId)
  //     .eq('match_id', fixtureId)
  //     .maybeSingle();

  //   if (error) {
  //     throw error;
  //   }
  //   return data;
  // },
};
