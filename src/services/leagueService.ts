import { SupabaseClient } from "@supabase/supabase-js";

export const createLeague = async (
  leagueData: any,
  supabase: SupabaseClient
) => {
  const { data, error } = await supabase
    .from("leagues")
    .insert(leagueData)
    .select()
    .single();

  return { data, error };
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
