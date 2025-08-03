import { supabase } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import useAuthStore from "./store/AuthStore";

// F6HIC-R
const useLeagueService = () => {
  
  const {session} = useAuthStore()


  

// Done - Create League
const createLeague = async (newLeague: {
  name: string;
  join_code: string;
  competition_id: number;
}) => {
  
    const {data,error } = await supabase.rpc('create_league', {
      p_league_name: newLeague.name,
      p_join_code: newLeague.join_code,
      p_competition_id: newLeague.competition_id,
      p_owner_id: session?.user?.id as string
    });
   if(error) {
    throw new Error(error.message)
   }
   return data;
}

const setPrimaryLeague = async (leagueId: string) => {
  const { data, error } = await supabase.rpc('update_user_primary_league', {
    p_league_id: leagueId,
    p_user_id: session?.user?.id
  });
  return { data, error };
};
// Done - Get My Leagues
const getMyLeagues = async () => {
  try {
         const { data, error } = await supabase
      .from('league_members')
      .select(`
        joined_at,
        primary_league,
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
      .order('primary_league', { ascending: false });
    if (error ) {
      return { data: null, error };
    }
    type LeagueData = {
      joined_at: string;
      primary_league: boolean;
      league: {
        name: string;
        join_code: string;
        owner_id: string;
        max_members: number;
        competitions: {
          name: string;
          logo: string;
          flag: string;
        };
      };
    };
    
    const transformedData = (data as unknown as LeagueData[]).map(item => ({
      name: item.league?.name,
      join_code: item.league?.join_code,
      owner_id: item.league?.owner_id,
      max_members: item.league?.max_members,
      joined_at: item.joined_at,
      primary_league: item.primary_league,
      competition_flag: item.league?.competitions?.flag,
      competition_name: item.league.competitions.name,
      competition_logo: item.league.competitions.logo,
    }));
    return { data: transformedData, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
//Done - Find League by Join Code
const findLeagueByJoinCode = async (joinCode: string) => {
  const { data, error } = await supabase.from("leagues").select("id,name,join_code,max_members ,competitions!inner (id,name,logo,flag,country)").eq("join_code", joinCode).maybeSingle();
return { data, error };

}; 
// Done - Join League
const joinLeague = async (leagueId: string) => {
  const { data, error } = await supabase.from("league_members").insert({ league_id: leagueId, user_id: session?.user?.id as string    }).select().single();
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
const getLeagueLeaderboard = async () => {
  const { data, error } = await supabase.from("league_members").select("*").eq('user_id', session?.user?.id as string)
  console.log("data  ", JSON.stringify(data, null, 2) )
  
  return { data, error };
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
    getLeagueLeaderboard,
    findLeagueByJoinCode,
    setPrimaryLeague
  };
};

export { useLeagueService };
