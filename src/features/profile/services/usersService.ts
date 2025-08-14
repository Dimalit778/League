import { supabase } from "@/lib/supabase/supabase";
import { TablesInsert, TablesUpdate } from "@/types/database.types";

type UserInsert = TablesInsert<"users">;
type UserUpdate = TablesUpdate<"users">;

export const userService = {
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId: string, updates: UserUpdate) {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createUserProfile(user: UserInsert) {
    const { data, error } = await supabase
      .from("users")
      .insert(user)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserLeagues(userId: string) {
    const { data, error } = await supabase
      .from("league_members")
      .select(`
        *,
        league:leagues(
          *,
          competition:competitions(*)
        )
      `)
      .eq("user_id", userId)
      .order("is_primary", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUserPrimaryLeague(userId: string) {
    const { data, error } = await supabase
      .from("league_members")
      .select(`
        *,
        league:leagues(
          *,
          competition:competitions(*)
        )
      `)
      .eq("user_id", userId)
      .eq("is_primary", true)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getLeagueMembers(leagueId: number) {
    const { data, error } = await supabase
      .from("league_members")
      .select(`
        *,
        user:users(*)
      `)
      .eq("league_id", leagueId)
      .order("points", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUserStats(userId: string) {
    let query = supabase
      .from("user_predictions")
      .select(`
        *,
        fixtures!inner(*)
      `)
      .eq("user_id", userId);

    const { data, error } = await query;

    if (error) throw error;

    const totalPredictions = data.length;
    const totalPoints = data.reduce((sum, prediction) => sum + prediction.points, 0);
    const correctPredictions = data.filter(p => p.points > 0).length;
    const accuracy = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0;

    return {
      totalPredictions,
      totalPoints,
      correctPredictions,
      accuracy: Math.round(accuracy * 100) / 100
    };
  }
};
