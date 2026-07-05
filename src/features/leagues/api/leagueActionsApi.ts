import { supabase } from "@/lib/supabase";

export const leagueActionsApi = {
    async createLeague(params: {
    league_name: string;
    max_members: number;
    competition_id: number;
    nickname: string;
    avatar_url?: string;
  }) {
    const { data, error } = await supabase.rpc('create_new_league', {
      league_name: params.league_name,
      max_members: params.max_members,
      competition_id: params.competition_id,
      nickname: params.nickname,
      avatar_url: params.avatar_url,
    });

    if (error) throw new Error(error.message || 'Failed to create league');

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
      .select('id, name')
      .single();
    if (error) throw new Error(error.message);
    return updated;
  },
  async leaveLeague(leagueId: string) {
    const { data, error } = await supabase.rpc('leave_league', {
      p_league_id: leagueId,
    });

    if (error) {
      throw new Error(error.message || 'Failed to leave league');
    }

    return data;
  },
  async deleteLeague(leagueId: string) {
    const { data, error } = await supabase.rpc('delete_owned_league', {
      p_league_id: leagueId,
    });

    if (error) throw new Error(error.message || 'Failed to delete league');
    if (!data) throw new Error('Failed to delete league');

    return data;
  }
};