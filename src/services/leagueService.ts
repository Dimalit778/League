import { supabase } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

const FOOTBALL_API_KEY = process.env.EXPO_PUBLIC_FOOTBALL_API_KEY;


const generateRandomCode = (length: number): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createLeague = async (leagueInput: {
  name: string;
  selected_league: string;
  owner_id: string;
}) => {
  try {
    // Generate join code
    const join_code = generateRandomCode(6);
    console.log("join_code", join_code);
    console.log("leagueInput", leagueInput);
    
    const { data: newLeague, error: newLeagueError } = await supabase
      .from("leagues")
      .insert({
        name: leagueInput.name,
        owner_id: leagueInput.owner_id,
        join_code: join_code,
        league_id: leagueInput.selected_league,
      })
      .select()
      .single();

    if (newLeagueError) {
      console.error("League creation error:", newLeagueError);
      return { data: null, error: newLeagueError };
    }

    return {
      data: {
        success: true,
        league_id: newLeague.id,
        join_code: newLeague.join_code,
      },
      error: null,
    };
  } catch (error) {
    console.error("Create league error:", error);
    return {
      data: null,
      error: { message: "An unexpected error occurred" },
    };
  }
};



export const joinLeague = async (
  leagueId: string,
  userId: string,
  nickname: string,
  supabase: SupabaseClient
) => {
  const { data, error } = await supabase
    .from("league_members")
    .insert({
      league_id: leagueId,
      user_id: userId,
      nickname,
    })
    .select()
    .single();

  return { data, error };
};

export const getLeagueMatches = async (
  league: string,
  supabase: SupabaseClient
) => {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("league", league)
    .gte("kickoff", new Date().toISOString())
    .order("kickoff", { ascending: true });

  return { data, error };
};
export const getMyLeagues = async (userId: string, supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from("league_members")
    .select("*")
    .eq("user_id", userId);
  return { data, error };
};
