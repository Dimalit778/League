import { SupabaseClient } from "@supabase/supabase-js";

export const getUserProfile = async (
  userId: string,
  supabase: SupabaseClient
) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  return { data, error };
};

export const getUserLeagues = async (
  userId: string,
  supabase: SupabaseClient
) => {
  const { data, error } = await supabase
    .from("league_members")
    .select(
      `
          *,
          league:leagues(*)
        `
    )
    .eq("user_id", userId);

  return { data, error };
};
export const createPrediction = async (
  predictionData: any,
  supabase: SupabaseClient
) => {
  const { data, error } = await supabase
    .from("predictions")
    .upsert(predictionData)
    .select()
    .single();

  return { data, error };
};
export const getUserPredictions = async (
  userId: string,
  leagueId: string,
  supabase: SupabaseClient
) => {
  const { data, error } = await supabase
    .from("predictions")
    .select(
      `
          *,
          match:matches(*)
        `
    )
    .eq("user_id", userId)
    .eq("league_id", leagueId)
    .order("created_at", { ascending: false });

  return { data, error };
};
export const getLeaderboard = async (
  leagueId: string,
  supabase: SupabaseClient
) => {
  const { data, error } = await supabase
    .from("leaderboards")
    .select("*")
    .eq("league_id", leagueId)
    .order("total_points", { ascending: false });

  return { data, error };
};
