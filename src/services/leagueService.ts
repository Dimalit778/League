import { supabase } from "@/lib/supabase";
import useLeagueStore from "@/store/useLeagueStore";
import { TablesInsert } from "@/types/database.types";
import { SupabaseClient } from "@supabase/supabase-js";
type League = TablesInsert<"leagues">;
type LeagueMember = TablesInsert<"league_members">;

// * Supabase Queries *  

const useLeagueService = () => {  
const { setLeague } = useLeagueStore();
// Done - Get My Leagues
const getMyLeagues = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('league_members')
      .select(`
        is_primary,
        nickname,
        league:leagues(*),
        league_id
      `)
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });
    
    if (error) {
      throw new Error(error.message)
    }

    // Get member counts for each league
    if (data) {
      const leagueIds = data.map(item => item.league_id);
      
      const { data: memberCounts, error: memberCountError } = await supabase
        .from('league_members')
        .select('league_id')
        .in('league_id', leagueIds);

      if (memberCountError) {
        console.error('Error fetching member counts:', memberCountError);
      }

      // Add member count to each league
      const dataWithCounts = data.map(item => {
        const memberCount = memberCounts?.filter(mc => mc.league_id === item.league_id).length || 0;
        return {
          ...item,
          league: {
            ...item.league,
            current_members: memberCount
          }
        };
      });

      // Set primary league if found, then return dataWithCounts
      const primaryLeague = dataWithCounts.find((item: any) => item.is_primary);
      if (primaryLeague) {
        setLeague(primaryLeague.league);
      }
      return dataWithCounts;
    }
  } catch (error) {
    throw new Error(error as string);
  }
};
const getLeagueById = async (leagueId: number) => {
    const { data, error } = await supabase.from("leagues").select( "id,name,join_code,league_logo,max_members ,competitions!inner (name,country,flag,current_round,rounds_data,season)").eq("id", leagueId).single();
  if (error) {
    throw new Error(error.message);
  }

  return data;
};
// Done - Create League
const createLeague = async (userId: string ,nickname: string, params: League) => {

    const { data: leagueData, error } = await supabase.from("leagues").insert<League>({
      name: params.name,
      league_logo: params.league_logo,
      join_code: params.join_code,
      max_members: params.max_members,
      competition_id: params.competition_id,
      owner_id: userId,
    }).select(`
      *,
      competitions!inner (
        id,
        name,
        country,
        logo,
        flag,
        rounds_data,
        current_round,
        season
      )
    `).single();

    if (error) throw new Error(error.message);
  
    if(leagueData) {
      const { error: resetPrimaryError } = await supabase
        .from('league_members')
        .update({ is_primary: false })
        .eq('user_id', userId);

      if (resetPrimaryError) throw new Error(resetPrimaryError.message);
    

      const { data: leagueMemberData, error: leagueMemberError } = await supabase.from('league_members').insert<LeagueMember>({
        league_id: leagueData.id,
        user_id: userId,
        nickname: nickname,
        is_primary: true,
        
      }).select().single();
      if(leagueMemberError) throw new Error(leagueMemberError.message);


      const newLeagueData = {
        ...leagueData,
        nickname: nickname,
        member_count: 1,
      }
      setLeague(leagueData);
      return newLeagueData;
    }
    
    
};
// Done - Join League
const joinLeague = async (userId: string, leagueId: number, nickname: string) => {
  // Set all existing memberships for this user to non-primary
  const { error: resetPrimaryError } = await supabase
    .from('league_members')
    .update({ is_primary: false })
    .eq('user_id', userId);

  if (resetPrimaryError) {
    return { data: null, error: resetPrimaryError };
  }

  const { data, error } = await supabase
    .from("league_members")
    .insert({ league_id: leagueId, user_id: userId, nickname: nickname ,is_primary: true})
    .select()
    .single();
return { data, error };
};
const setPrimaryLeague = async (userId: string, leagueId: number) => {
  try {
    // Step 1: Set all user's league memberships to is_primary = false
    const { error: resetPrimaryError } = await supabase
      .from('league_members')
      .update({ is_primary: false })
      .eq('user_id', userId);
    
    if (resetPrimaryError) {
      throw new Error(`Failed to reset primary leagues: ${resetPrimaryError.message}`);
    }

    // Step 2: Set the specific league to is_primary = true
    const { data, error } = await supabase
      .from('league_members')
      .update({ is_primary: true })
      .eq('user_id', userId)
      .eq('league_id', leagueId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to set primary league: ${error.message}`);
    }

    if (!data) {
      throw new Error('User is not a member of this league');
    }

    return data;
  } catch (error) {
    console.error('Error setting primary league:', error);
    throw error;
  }
};

//Done - Find League by Join Code
const findLeagueByJoinCode = async (joinCode: string) => {
  const { data, error } = await supabase.from("leagues").select("id,name,join_code,max_members ,competitions!inner (id,name,logo,flag,country)").eq("join_code", joinCode).maybeSingle();
return { data, error };
};

const getLeaderboard = async (leagueId: number) => {
  const { data, error } = await supabase.from("league_members").select("id,nickname,points").eq("league_id", leagueId).order("points", { ascending: false });
  if(error) throw new Error(error.message);
  return data;
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

  return {
    createLeague,
    getCompetitions,
    getLeagueMatches,
    getMyLeagues,
    joinLeague, 
    findLeagueByJoinCode,
    getLeagueById,
    getLeaderboard,
    setPrimaryLeague
  };
};

export { useLeagueService };
