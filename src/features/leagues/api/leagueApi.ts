import { supabase } from '@/lib/supabase';

export const leagueApi = {
  async getLeaderboardView(leagueId: string) {
    const { data, error } = await supabase.from('league_leaderboard_view').select('*').eq('league_id', leagueId);

    if (error) throw error;
    return data;
  },
  async getMyLeagues(userId: string) {
    const { data, error } = await supabase
      .from('league_members')
      .select('*, league:leagues!league_id(*,competition:competitions(*))')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });

    if (error) throw new Error(error.message);

    return data;
  },
  async getMyLeaguesView(userId: string) {
    const { data, error } = await supabase
      .from('my_leagues_view')
      .select('*')
      .order('is_primary', { ascending: false }) // primary leagues first
      .order('league_created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getLeagueAndMembers(leagueId: string) {
    const { data: leagueData, error: leagueError } = await supabase
      .from('leagues')
      .select('*,competition:competitions!inner(*),league_members(*)')
      .eq('id', leagueId)
      .single();

    if (leagueError) throw new Error(leagueError.message);

    return leagueData;
  },
  async getLeagueWithCompetition(leagueId: string) {
    const { data, error } = await supabase
      .from('leagues')
      .select('*,competition:competitions(*)')
      .eq('id', leagueId)
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('League not found');

    return data;
  },

  async updatePrimaryLeague(userId: string, leagueId: string) {
    const { error: unsetLeaguesError } = await supabase
      .from('league_members')
      .update({ is_primary: false })
      .eq('user_id', userId)
      .neq('league_id', leagueId);

    if (unsetLeaguesError) throw new Error(unsetLeaguesError.message);
    const { data: primaryLeague, error: setPrimaryError } = await supabase
      .from('league_members')
      .update({
        is_primary: true,
      })
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .select('*, league:leagues!league_id(*, competition:competitions(*))')
      .single();

    if (setPrimaryError) throw new Error(setPrimaryError.message);

    return primaryLeague;
  },

  async removeMember(memberId: string) {
    console.log('memberId', memberId);
    const { data: memberData, error: memberError } = await supabase
      .from('league_members')
      .select('*')
      .eq('id', memberId)
      .single();
    console.log('memberError', JSON.stringify(memberError, null, 2));
    console.log('memberData', JSON.stringify(memberData, null, 2));

    if (memberError) throw new Error(memberError.message);
    if (!memberData) throw new Error('Member not found');

    const leagueId = memberData.league_id;

    const { data, error } = await supabase.from('league_members').delete().eq('id', memberId);
    if (error) throw new Error(error.message);
    console.log('data', JSON.stringify(data, null, 2));
    console.log('error', JSON.stringify(error, null, 2));
    return { data, leagueId };
  },
  //  -- LEAGUE OPERATIONS
  async createLeague(params: { league_name: string; max_members: number; competition_id: number; nickname: string }) {
    const { data, error } = await supabase.rpc('create_new_league', {
      league_name: params.league_name,
      max_members: params.max_members,
      competition_id: params.competition_id,
      nickname: params.nickname,
    });

    if (error) throw error;

    console.log('data', JSON.stringify(data, null, 2));
    return data;
  },
  async joinLeague(joinCode: string, nickname: string) {
    const { data, error } = await supabase.rpc('join_league', {
      league_join_code: joinCode,
      user_nickname: nickname,
    });

    if (error) {
      throw new Error(error.message || 'Failed to join league');
    }

    if (!data) {
      throw new Error('Failed to join league');
    }

    return data;
  },
  async updateLeague(leagueId: string, data: { name?: string }) {
    const { data: updated, error } = await supabase
      .from('leagues')
      .update({ ...data })
      .eq('id', leagueId)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return updated;
  },
  async leaveLeague(leagueId: string) {
    const { data, error } = await supabase.rpc('leave_league', {
      p_league_id: leagueId,
    });
    console.log('data', JSON.stringify(data, null, 2));
    console.log('error', JSON.stringify(error, null, 2));

    if (error) {
      throw new Error(error.message || 'Failed to leave league');
    }

    return data;
  },
  async findLeagueByJoinCode(joinCode: string) {
    const { data, error } = await supabase.rpc('find_league_by_code', {
      p_join_code: joinCode,
    });

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error('League not found');

    const league = data[0];

    return league;
  },
};
