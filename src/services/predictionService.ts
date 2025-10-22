import { supabase } from '@/lib/supabase';
import { TablesInsert, TablesUpdate } from '@/types/database.types';

type UserPredictionInsert = TablesInsert<'predictions'>;
type UserPredictionUpdate = TablesUpdate<'predictions'>;

export const predictionService = {
  // Create
  async createPrediction(prediction: UserPredictionInsert) {
    const { data, error } = await supabase
      .from('predictions')
      .insert({
        user_id: prediction.user_id,
        match_id: prediction.match_id,
        home_score: prediction.home_score,
        away_score: prediction.away_score,
        league_id: prediction.league_id,
        league_member_id: prediction.league_member_id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  // Update Prediction
  async updatePrediction(updates: UserPredictionUpdate) {
    const { id, user_id, ...rest } = updates;
    if (!id) throw new Error('Prediction ID is required');
    if (!user_id) throw new Error('User ID is required');

    const { data, error } = await supabase
      .from('predictions')
      .update({
        home_score: updates.home_score,
        away_score: updates.away_score,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },
  // Get Member Predictions
  async getMemberPredictions(userId: string, fixtureIds?: number[]) {
    let query = supabase
      .from('predictions')
      .select(
        `
        *,
        matches!inner(
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        )
      `
      )
      .eq('user_id', userId);

    if (fixtureIds && fixtureIds.length > 0) {
      query = query.in('match_id', fixtureIds);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;
    return data;
  },
  // Get Member Predictions By Round
  async getMemberPredictionsByRound(userId: string, round: string) {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId);
    // .eq("round", round);

    if (error) throw error;
    return data;
  },
  // Delete Prediction
  async deletePrediction(id: string) {
    const { error } = await supabase.from('predictions').delete().eq('id', id);

    if (error) throw error;
  },
  // Get Member Prediction By Fixture
  async getMemberPredictionByFixture(userId: string, fixtureId: number) {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId)
      .eq('match_id', fixtureId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching prediction:', error);
      throw error;
    }
    return data;
  },
  // Get League Predictions By Fixture
  async getLeaguePredictionsByFixture(fixtureId: number, leagueId: string) {
    const { data, error } = await supabase
      .from('predictions')
      .select(
        `
        id,
        user_id,
        league_id,
        match_id,
        home_score,
        away_score,
        points,
        member:league_members!inner(id, nickname, avatar_url)
      `
      )
      .eq('league_id', leagueId)
      .eq('match_id', fixtureId)
      .order('points', { ascending: false });

    if (error) throw error;

    return data;
  },
};
