import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

export const supabase = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
};
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase().auth.startAutoRefresh();
  } else {
    supabase().auth.stopAutoRefresh();
  }
});
// Database helper functions
// export const createUser = async (
//   email: string,
//   password: string,
//   displayName: string
// ) => {
//   try {
//     const { data: authData, error: authError } = await supabase.auth.signUp({
//       email,
//       password,
//     });

//     if (authError) throw authError;

//     if (authData.user) {
//       const { error: profileError } = await supabase.from("users").insert({
//         id: authData.user.id,
//         email,
//         display_name: displayName,
//         subscription_tier: "free",
//       });

//       if (profileError) throw profileError;
//     }

//     return { data: authData, error: null };
//   } catch (error) {
//     return { data: null, error: error as Error };
//   }
// };

// export const signIn = async (email: string, password: string) => {
//   try {
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     return { data, error };
//   } catch (error) {
//     return { data: null, error: error as Error };
//   }
// };

// export const signOut = async () => {
//   try {
//     const { error } = await supabase.auth.signOut();
//     return { error };
//   } catch (error) {
//     return { error: error as Error };
//   }
// };

// // Database queries
// export const getUserProfile = async (userId: string) => {
//   const { data, error } = await supabase
//     .from("users")
//     .select("*")
//     .eq("id", userId)
//     .single();

//   return { data, error };
// };

// export const createLeague = async (leagueData: any) => {
//   const { data, error } = await supabase
//     .from("leagues")
//     .insert(leagueData)
//     .select()
//     .single();

//   return { data, error };
// };

// export const joinLeague = async (
//   leagueId: string,
//   userId: string,
//   nickname: string
// ) => {
//   const { data, error } = await supabase
//     .from("league_members")
//     .insert({
//       league_id: leagueId,
//       user_id: userId,
//       nickname,
//     })
//     .select()
//     .single();

//   return { data, error };
// };

// export const getUserLeagues = async (userId: string) => {
//   const { data, error } = await supabase
//     .from("league_members")
//     .select(
//       `
//         *,
//         league:leagues(*)
//       `
//     )
//     .eq("user_id", userId);

//   return { data, error };
// };

// export const getLeagueMatches = async (league: string) => {
//   const { data, error } = await supabase
//     .from("matches")
//     .select("*")
//     .eq("league", league)
//     .gte("kickoff", new Date().toISOString())
//     .order("kickoff", { ascending: true });

//   return { data, error };
// };

// export const createPrediction = async (predictionData: any) => {
//   const { data, error } = await supabase
//     .from("predictions")
//     .upsert(predictionData)
//     .select()
//     .single();

//   return { data, error };
// };

// export const getLeaderboard = async (leagueId: string) => {
//   const { data, error } = await supabase
//     .from("leaderboards")
//     .select("*")
//     .eq("league_id", leagueId)
//     .order("total_points", { ascending: false });

//   return { data, error };
// };

// export const getUserPredictions = async (userId: string, leagueId: string) => {
//   const { data, error } = await supabase
//     .from("predictions")
//     .select(
//       `
//         *,
//         match:matches(*)
//       `
//     )
//     .eq("user_id", userId)
//     .eq("league_id", leagueId)
//     .order("created_at", { ascending: false });

//   return { data, error };
// };
