import { supabase } from "@/lib/supabase/supabase";
import { TablesInsert } from "@/types/database.types";
import { SupabaseClient } from "@supabase/supabase-js";
type League = TablesInsert<"leagues">;

// * Supabase Queries *  

const useLeagueService = () => {  
// Done - Get My Leagues
const getLeagues = async (userId: string) => {
  const { data, error } = await supabase.rpc('get_user_leagues', {
    user_uuid: userId
  });
  if (error) {  
    throw new Error(error.message);
  }
  return data;
};
const getLeagueDetails = async (leagueId: string) => {
   const { data: leagueData, error: leagueError } = await supabase
   .from("leagues")
   .select(`
     id,
     name,
     owner_id,
     join_code,
     competition_id,
     max_members,
     created_at,
     competition:competitions(
      name,
      logo,
      flag,
      country,
      season  
     )
   `)
   .eq("id", leagueId)
   .single();

 if (leagueError) throw new Error(leagueError.message);
 if (!leagueData) throw new Error("No league found");

 const { data: membersData, error: membersError } = await supabase
   .from("league_members")
   .select("user_id,nickname,avatar_url")
   .eq("league_id", leagueId)
   

 if (membersError) throw new Error(membersError.message);
 const ownerMember = membersData.find(
  (member: any) => member.user_id === leagueData.owner_id
);


  return { ...leagueData, league_owner: ownerMember ,membersCount: membersData.length};
};

const createLeague = async (userId: string ,nickname: string, params: League) => {
  
};
// Done - Join League
const joinLeague = async (userId: string, join_code: string, nickname: string, avatar_url?: string) => {
  const { data, error } = await supabase.rpc('join_league', {
    joining_user_id: userId,
    league_join_code: join_code,
    user_nickname: nickname,
    user_avatar_url: avatar_url,
  });
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

//Done - Find League by Join Code
const findLeagueByJoinCode = async (joinCode: string) => {
  const { data, error } = await supabase.from("leagues").select("id,name,join_code,max_members ,competitions!inner (id,name,logo,flag,country)").eq("join_code", joinCode).maybeSingle();
return { data, error };
};
//Done - Get Competitions
 const getCompetitions = async () => {
  const { data, error } = await supabase.from("competitions").select("*");
  if (error) {
    throw new Error(error.message)
  }
  return data
};
 const getLeagueMatches = async (
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
const leaveLeague = async (userId: string, leagueId: number) => {
  try {
    const { error } = await supabase
      .from('league_members')
      .delete()
      .eq('user_id', userId)
      .eq('league_id', leagueId);
    
    if (error) {
      throw new Error(`Failed to leave league: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error leaving league:', error);
    throw error;
  }
};

  return {
    createLeague,
    getCompetitions,
    getLeagueMatches,
    getLeagues,
    joinLeague, 
    findLeagueByJoinCode,
    getLeagueDetails,
    // setPrimaryLeague,
    leaveLeague,
  
  };
};

export { useLeagueService };
