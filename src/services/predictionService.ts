import { supabase } from "@/lib/supabase";
import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types";

type UserPrediction = Tables<"user_predictions">;
type UserPredictionInsert = TablesInsert<"user_predictions">;
type UserPredictionUpdate = TablesUpdate<"user_predictions">;

export const predictionService = {
  async createPrediction(prediction: UserPredictionInsert) {
    const { data, error } = await supabase
      .from("user_predictions")
      .insert(prediction)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePrediction(id: string, updates: UserPredictionUpdate) {
    const { data, error } = await supabase
      .from("user_predictions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserPredictions(userId: string, fixtureIds?: number[]) {
    let query = supabase
      .from("user_predictions")
      .select(`
        *,
        fixtures!inner(
          *,
          home_team:teams!fixtures_home_team_id_fkey(*),
          away_team:teams!fixtures_away_team_id_fkey(*)
        )
      `)
      .eq("user_id", userId);

    if (fixtureIds && fixtureIds.length > 0) {
      query = query.in("fixture_id", fixtureIds);
    }

    const { data, error } = await query.order("createdAt", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getPredictionByUserAndFixture(userId: string, fixtureId: number) {
    const { data, error } = await supabase
      .from("user_predictions")
      .select("*")
      .eq("user_id", userId)
      .eq("fixture_id", fixtureId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deletePrediction(id: string) {
    const { error } = await supabase
      .from("user_predictions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async getLeaguePredictions(leagueId: number, fixtureId?: number) {
    let query = supabase
      .from("user_predictions")
      .select(`
        *,
        users!inner(full_name, avatar_url),
        fixtures!inner(
          *,
          home_team:teams!fixtures_home_team_id_fkey(*),
          away_team:teams!fixtures_away_team_id_fkey(*)
        )
      `);

    if (fixtureId) {
      query = query.eq("fixture_id", fixtureId);
    }

    const { data, error } = await query.order("points", { ascending: false });

    if (error) throw error;
    return data;
  }
};