import { supabase } from "@/lib/supabase";
import { Tables, TablesInsert, TablesUpdate } from "@/types/database.types";

type UserPrediction = Tables<"predictions">;
type UserPredictionInsert = TablesInsert<"predictions">;
type UserPredictionUpdate = TablesUpdate<"predictions">;
type Fixture = Tables<"fixtures">;

export const predictionService = {
 
  // Create 
  async createPrediction(prediction: UserPredictionInsert) {
    const { data, error } = await supabase
      .from("predictions")
      .insert({
        user_id: prediction.user_id,
        fixture_id: prediction.fixture_id,
        home_score: prediction.home_score,
        away_score: prediction.away_score,
        league_id: prediction.league_id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  // Update Prediction
  async updatePrediction( updates: UserPredictionUpdate) {
  
    const { data, error } = await supabase
      .from("predictions")
      .update({
        home_score: updates.home_score,
        away_score: updates.away_score,
        updated_at: new Date().toISOString()
      })
      .eq("id", updates.id ?? '')
      .eq("user_id", updates.user_id!)
      .select()
      .single();

    if (error) throw error;
  
    return data;
  },
  // Get User Predictions
  async getUserPredictions(userId: string, fixtureIds?: number[]) {
    let query = supabase
      .from("predictions")
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
   // Delete Prediction
   async deletePrediction(id: string) {
    const { error } = await supabase
      .from("predictions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
  // Get User Prediction By Fixture
  async getUserPredictionByFixture(userId: string, fixtureId: number) {
    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", userId)
      .eq("fixture_id", fixtureId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
  // Get League Predictions By Fixture
  async getLeaguePredictionsByFixture(fixtureId: number, leagueId: string) {
    const { data, error } = await supabase
      .from("predictions")
      .select(`
        id,
        user_id,
        league_id,
        fixture_id,
        home_score,
        away_score,
        points,
        member:league_members!inner(id, nickname, avatar_url)
      `)
      .eq("league_id", leagueId)
      .eq("fixture_id", fixtureId).order("points", { ascending: false });

    if (error) throw error;
    
  
    
    return data;
  },
 
}