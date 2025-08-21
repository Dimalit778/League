import { supabase } from "@/lib/supabase";
import { generateJoinCode } from "@/services/helpers";
import { Tables } from "@/types/database.types";
import { CreateLeagueParams } from "@/types/league.types";




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
  
  console.log('leagues---', JSON.stringify(leagues, null, 2));
  return leagues;
},

// GET league by id
 async getLeagueById(leagueId: string) {
      const { data, error } = await supabase.from("leagues").select("*").eq("id", leagueId).single();
      if (error) throw error;
      return data;
 },
// JOIN league
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
// GET leaderboard
async getLeagueLeaderboard(leagueId: string) {
    const { data, error } = await supabase.from("league_members").select("*, predictions('*')")
    .eq("league_id", leagueId)


    console.log('data---', JSON.stringify(data, null, 2));
  if(error) throw new Error(error.message);
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
  const { data, error } = await supabase.from("league_members").update({
    is_primary: true
  }).eq("league_id", leagueId).eq("user_id", userId).single();
  if(error) throw new Error(error.message);
  return data;
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
        logo: params.logo,
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
    .eq('league_id', league.id)
    .eq('user_id', params.owner_id);

    if(updateError) throw new Error(updateError.message);
}

    const { error: memberError } = await supabase
      .from('league_members')
      .insert({
        league_id: league.id,
        user_id: params.owner_id,
        nickname: params.nickname,
        avatar_url: params.logo,
        is_primary: true
      });

    if (memberError) throw memberError;

  return league as Tables<"leagues">;
  
},    
}