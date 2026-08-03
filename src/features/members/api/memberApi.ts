import { supabase } from '@/lib/supabase';

export const memberApi = {
  async getMember(memberId: string) {
    const { data, error } = await supabase
      .from('league_members')
      .select(
        `
    id,
    user_id,
    league_id,
    nickname,
    avatar_url,
    active,
    is_primary,
    created_at,
    league:leagues (
      id,
      name,
      owner_id,
      competition_id,
      competition:competitions (
        id,
        name,
        code,
        logo,
        flag,
        area
      )
    )
  `,
      )
      .eq('id', memberId)
      .single();

    if (error) throw error;

    return data;
  },
  async updateMember(memberId: string, nickname: string) {
    const { data, error } = await supabase
      .from('league_members')
      .update({ nickname })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  async getMemberPredictions(memberId: string) {
    const { data, error } = await supabase
      .from('predictions')
      .select(
        `
        *,
        matches!inner(
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        )
      `
      )
      .eq('league_member_id', memberId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
  async getMemberInfo(memberId: string) {
    const { data, error } = await supabase
      .from('league_members')
      .select(
        `
        nickname,
        avatar_url,
        league:leagues!league_id(
          id,
          competition:competitions(id, current_fixture, total_fixtures)
        )
      `,
      )
      .eq('id', memberId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return data;
  },
 
  async removeMember(memberId: string) {
    const { data, error } = await supabase.rpc('remove_league_member', {
      p_member_id: memberId,
    });
    if (error) throw new Error(error.message);

    const result = data as { league_id?: string } | null;
    if (!result?.league_id) throw new Error('Failed to remove member');

    return { data, leagueId: result.league_id };
  },
  async getMyMemberByLeague(userId: string, leagueId: string) {
    const { data, error } = await supabase
      .from('league_members')
      .select(`
        active,
        avatar_url,
        created_at,
        id,
        is_primary,
        league_id,
        nickname,
        updated_at,
        user_id,
        league:leagues!league_id(
          competition_id,
          created_at,
          id,
          join_code,
          max_members,
          name,
          owner_id,
          updated_at,
          competition:competitions(*)
        )
      `)
      .eq('user_id', userId)
      .eq('league_id', leagueId)
      .eq('active', true)
      .maybeSingle();
  
    if (error) throw new Error(error.message);
  
    return data;
  }
};
