import { supabase } from "@/lib/supabase";
import { TablesInsert } from "@/types/database.types";
type League = TablesInsert<"leagues">;



export const leagueService = {
  
async getMyLeagues(userId: string) {
  const { data, error } = await supabase
          .from('league_members')
          .select(`
            nickname,
            league:leagues(*),
            league_id
          `)
          .eq('user_id', userId)
        if (error) throw new Error(error.message)
    
          const leagueIds = data.map(item => item.league_id);
          const { data: memberCounts, error: memberCountError } = await supabase
            .from('league_members')
            .select('league_id')
            .in('league_id', leagueIds);
    
          if (memberCountError) throw new Error(memberCountError.message);
    
          const dataWithCounts = data.map(item => {
            const memberCount = memberCounts?.filter(mc => mc.league_id === item.league_id).length || 0;
            return {
              ...item,
              league: {
                ...item.league,
                current_members: memberCount,
         
              }
            };
          });
    
          return dataWithCounts;
},
 async getLeagueById(leagueId: string) {
      const { data, error } = await supabase.from("leagues").select("*").eq("id", leagueId).single();
      if (error) throw error;
      return data;
 },
 async createLeague(userId: string ,nickname: string, params: League, avatar_url: string) {
 const { data, error } = await supabase.rpc('create_league_with_member', {
  creator_user_id: userId,
  creator_nickname: nickname,
  league_name: params.name,
  max_members: params.max_members || 10,
  competition_id: params.competition_id,
  creator_avatar_url: avatar_url || ''
 })
 if(error) throw new Error(error.message);
 return data;
},

async joinLeague(userId: string, joinCode: string, nickname: string, avatar_url: string) {
  const { data, error } = await supabase.rpc('join_league', {
    joining_user_id: userId,
    league_join_code: joinCode,
    user_nickname: nickname,
    user_avatar_url: avatar_url || ''
  })
  if(error) throw new Error(error.message);
  return data;
},

async findLeagueByJoinCode(joinCode: string) {
  const { data, error } = await supabase.from("leagues").select("id,name,join_code,max_members ,competitions!inner (id,name,logo,flag,country)").eq("join_code", joinCode).maybeSingle();
  if(error) throw new Error(error.message);
return data
},




}

