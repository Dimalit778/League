import { supabase } from "@/lib/supabase";
import { generateJoinCode } from "@/services/helpers";
import { CreateLeagueParams } from "@/types";
import { Tables } from "@/types/database.types";




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

// CREATE league and member
async createLeagueAndMember(params: CreateLeagueParams): Promise<Tables<"leagues">> {
  
  const { count, error: countError } = await supabase
    .from('league_members')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', params.owner_id);

  if (countError) throw new Error(countError.message);
  if (count && count >= 3) throw new Error('You can only create/join 3 leagues maximum');

  const joinCode = generateJoinCode();

  // Create league
  const { data: league, error: leagueError } = await supabase
    .from('leagues')
    .insert({
      name: params. name,
      owner_id: params.owner_id,
      join_code: joinCode,
      competition_id: params.competition_id,
      max_members: params.max_members
    })
    .select('id')
    .single();

  if (leagueError || !league) throw leagueError;

 // Update user leagues to false
 if(count && count >= 1) {
   const { error: updateError } = await supabase
  .from('league_members')
  .update({ is_primary: false })
  .eq('user_id', params.owner_id);

  if(updateError) throw new Error(updateError.message);
}

  const { error: memberError } = await supabase
    .from('league_members')
    .insert({
      league_id: league.id,
      user_id: params.owner_id,
      nickname: params.nickname,
      avatar_url: '',
      is_primary: true
    });

  if (memberError) throw memberError;
 
return league as Tables<"leagues">;

},    

// JOIN league - Edge function
async joinLeague(userId: string, joinCode: string, nickname: string) {
  const { data, error } = await supabase.rpc('join_league', {
    joining_user_id: userId,  
    league_join_code: joinCode,
    user_nickname: nickname,
    user_avatar_url: ''
  });

  if (error) throw new Error(error.message);
  return data;
},

// FIND league by join code
async findLeagueByJoinCode(joinCode: string) {
  const { data, error } = await supabase.from("leagues").select("id,name,join_code,max_members ,competitions!inner (id,name,logo,flag,country)").eq("join_code", joinCode).maybeSingle()
  if(error) throw new Error(error.message);
return data
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
