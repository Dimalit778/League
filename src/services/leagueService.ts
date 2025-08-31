import { supabase } from "@/lib/supabase";
import { createLeagueParams, createLeagueResponse } from "@/types";










export const leagueService = {
// GET user leagues
async getMyLeagues(userId: string) {
  const { data, error } = await supabase
  .from('league_members')
  .select(`
    is_primary,
    leagues!league_id(
      id,
      name,
      join_code,
      max_members,
      league_members(count),
      competitions!inner(
        id,
        logo
      )
    )
  `)
  .eq('user_id', userId)
  .order('is_primary', { ascending: false });

  if(error) throw new Error(error.message);
  
  const leagues = data.map(item => ({
    id: item.leagues.id,
    name: item.leagues.name,
    join_code: item.leagues.join_code,
    max_members: item.leagues.max_members,
    league_members: item.leagues.league_members[0].count,
    is_primary: item.is_primary,
    competition_id: item.leagues.competitions.id,
    logo: item.leagues.competitions.logo
  }));
  
  return leagues;
},
// edge function
// DELETE league membership
async leaveLeague(leagueId: string) {
    const { data, error } = await supabase.rpc('leave_league', {
    p_league_id: leagueId
  });
  if (error) throw new Error(error.message);
  
  return data
},



async createLeague(params: createLeagueParams) {
  const { data: leagueData, error } = await supabase.rpc(
    'create_new_league',
    {
      league_name: params.leagueName,
      max_members: params.max_members,
        competition_id: params.competition_id,
        nickname: params.nickname,
        avatar_url: ''
      }
    );

    console.log('League data:', JSON.stringify(leagueData, null, 2));

    if (error) throw new Error(error.message);

    
    return leagueData as createLeagueResponse;
  },
// edge function
// JOIN league 
async joinLeague( joinCode: string, nickname: string) {
  const { data, error } = await supabase.rpc('join_league', {
    league_join_code: joinCode,
    user_nickname: nickname,
    user_avatar_url: ''
  });
  if (error) throw new Error(error.message);
 
  
  return data;  

},

// FIND league by join code
async findLeagueByJoinCode(joinCode: string) {
  const { data, error } = await supabase.from("leagues").select("id,name,join_code,max_members ,competitions!inner (id,name,logo,flag,country) ,league_members(count)").eq("join_code", joinCode).maybeSingle()
  if(error) throw new Error(error.message);
  if(!data) throw new Error('League not found');
  const league = {
    id: data.id,
    name: data.name,
    join_code: data.join_code,
    max_members: data.max_members,
    league_members: data.league_members[0].count, 
    competition_id: data.competitions.id,
    logo: data.competitions.logo,
    country: data.competitions.country,
    flag: data.competitions.flag
  };

return league
},

// UPDATE primary league
async updatePrimaryLeague(userId: string, leagueId: string) {
  const { error } = await supabase.from("league_members").update({
    is_primary: false
  }).eq("user_id", userId);
  
  if(error) throw new Error(error.message);
  
  // Then set the selected league as primary
  const { data: primaryLeague, error: primaryLeagueError } = await supabase.from("league_members").update({
    is_primary: true
  }).eq("league_id", leagueId).eq("user_id", userId).single();

  if(primaryLeagueError) throw new Error(primaryLeagueError.message);
  
  
  return primaryLeague;
},
async getFullLeagueAndMembersById(leagueId: string) {
  const { data, error } = await supabase.from("leagues").select("id,name,join_code,max_members,competitions!inner(id,name,logo,country,flag) ,league_members(user_id,nickname,avatar_url)").eq("id", leagueId).single();
  if(error) throw new Error(error.message);
  return data;
},

}
