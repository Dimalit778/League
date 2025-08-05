import { supabase } from "@/lib/supabase";
import useAuthStore from "@/services/store/AuthStore";
import { Tables } from "@/types/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

type League = Tables<"leagues">;
type Competition = Tables<"competitions">;
type LeagueParams = {
  name: string;
  nickname: string;
  league_logo: string;
  join_code: string;
  max_members: number;
  competition_id: number;
};
type LeagueResponse = {
  success: boolean;
  league_id?: string;
  message?: string;
  error?: string;
  error_code?: string;
};
type LeagueData = {
  is_primary: boolean;
  league: League & {
    competitions: Competition;
  };
};

// F6HIC-R
const useLeagueService = () => {  
  const {session} = useAuthStore()

// Done - Create League
const createLeague = async (params: LeagueParams) => {
console.log("params", JSON.stringify(params, null, 2)); // Should be UUID


  try {
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }
    console.log("session.user.id:", session.user.id, typeof session.user.id);

    const { data, error } = await supabase.rpc('create_league', {
      p_name: params.name,
      p_nickname: params.nickname as string,
      p_league_logo: params.league_logo as string,
      p_join_code: params.join_code as string, 
      p_max_members: params.max_members as number,
      p_competition_id: params.competition_id as number,
      p_owner_id: session.user.id ,
    });

    const response = data as LeagueResponse;

    if (error) {
      console.log('createLeague error:', JSON.stringify(error, null, 2));
      throw new Error(error.message);
    }

    if (response && !response['success']) {
      console.log('createLeague RPC error:', response['error']);
      throw new Error(response['error'] || 'Failed to create league');
    }
    return response;
    
  } catch (error) {
    console.error('createLeague service error:', error);
    throw error;
  }
};


const setPrimaryLeague = async (leagueId: number) => {
  if (!session?.user?.id) {
    return { data: null, error: new Error('User not authenticated') };
  }
  
  const { data, error } = await supabase.rpc('update_user_primary_league', {
    p_league_id: leagueId,
    p_user_id: session.user.id
  });
  return { data, error };
};
// Done - Get My Leagues
const getMyLeagues = async (): Promise<{ data: LeagueData[] | null, error: Error | null }>   => {
  try {
         const { data, error } = await supabase
      .from('league_members')
      .select(`
        is_primary,
        league:leagues!inner (
          id,
          name,
          join_code,
          owner_id, 
          max_members,
          createdAt,
          competitions!inner (
            id,
            name,
            logo,
            flag
          )
        )
      `)
      .eq('user_id', session?.user?.id as string)
      .order('is_primary', { ascending: false });
    if (error ) {
      return { data: null, error };
    }
    return { data: data as LeagueData[], error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};
//Done - Find League by Join Code
const findLeagueByJoinCode = async (joinCode: string) => {
  const { data, error } = await supabase.from("leagues").select("id,name,join_code,max_members ,competitions!inner (id,name,logo,flag,country)").eq("join_code", joinCode).maybeSingle();
return { data, error };

}; 
// Done - Join League
const joinLeague = async (leagueId: number, nickname: string) => {
  const { data, error } = await supabase.from("league_members").insert({ league_id: leagueId, user_id: session?.user?.id as string, nickname: nickname    }).select().single();
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

  return {
    createLeague,
    getCompetitions,
    getLeagueMatches,
    getMyLeagues,
    joinLeague,
 
    findLeagueByJoinCode,
    setPrimaryLeague
  };
};

export { useLeagueService };
