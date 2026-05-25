import { supabase } from '@/lib/supabase';
import { LeaderboardRow, LeagueDetailsType, LeagueWithCompetitionType, MyLeagueType } from '../types';

const LEADERBOARD_SELECT = 'avatar_url, league_id, member_id, nickname, total_points, user_id';
const COMPETITION_SELECT = 'id, name, logo, area, flag';
const COMPETITION_FULL_SELECT = `
  area,
  code,
  created_at,
  current_fixture,
  flag,
  id,
  logo,
  name,
  season_end,
  season_id,
  season_start,
  total_fixtures,
  type,
  updated_at
`;
const MY_LEAGUES_SELECT = `
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
    locked_reason,
    max_members,
    name,
    owner_id,
    status,
    updated_at,
    competition:competitions(${COMPETITION_FULL_SELECT})
  )
`;
const LEAGUE_WITH_COMPETITION_SELECT = `
  competition_id,
  created_at,
  id,
  join_code,
  locked_reason,
  max_members,
  name,
  owner_id,
  status,
  updated_at,
  competition:competitions(${COMPETITION_SELECT})
`;
const LEAGUE_WITH_MEMBERS_SELECT = `
  ${LEAGUE_WITH_COMPETITION_SELECT},
  league_members(
    avatar_url,
    created_at,
    id,
    is_primary,
    league_id,
    nickname,
    updated_at,
    user_id
  )
`;

export const leagueApi = {
  async getLeaderboardView(leagueId: string) {
    const { data, error } = await supabase
      .from('league_leaderboard_view')
      .select(LEADERBOARD_SELECT)
      .eq('league_id', leagueId)
      .order('total_points', { ascending: false });

    if (error) throw error;
    return (data ?? []) as LeaderboardRow[];
  },
  async getMyLeagues(userId: string) {
    const { data, error } = await supabase
      .from('league_members')
      .select(MY_LEAGUES_SELECT)
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });

    if (error) throw new Error(error.message);

    return (data ?? []) as MyLeagueType[];
  },

  async getLeagueAndMembers(leagueId: string) {
    const { data: leagueData, error: leagueError } = await supabase
      .from('leagues')
      .select(LEAGUE_WITH_MEMBERS_SELECT)
      .eq('id', leagueId)
      .single();

    if (leagueError) throw new Error(leagueError.message);

    return leagueData as LeagueDetailsType;
  },
  async getLeagueWithCompetition(leagueId: string) {
    const { data, error } = await supabase
      .from('leagues')
      .select(LEAGUE_WITH_COMPETITION_SELECT)
      .eq('id', leagueId)
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('League not found');

    return data as LeagueWithCompetitionType;
  },

  async updatePrimaryLeague(leagueId: string) {
    const { data, error } = await supabase.rpc('set_primary_league', {
      p_league_id: leagueId,
    });

    if (error) throw new Error(error.message);
    return data;
  },

  async removeMember(memberId: string) {
    const { data: memberData, error: memberError } = await supabase
      .from('league_members')
      .select('id, league_id')
      .eq('id', memberId)
      .single();

    if (memberError) throw new Error(memberError.message);
    if (!memberData) throw new Error('Member not found');

    const leagueId = memberData.league_id;

    const { data, error } = await supabase.from('league_members').delete().eq('id', memberId);
    if (error) throw new Error(error.message);

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

  async findLeagueByJoinCode(joinCode: string) {
    const { data, error } = await supabase.rpc('find_league_by_code', {
      p_join_code: joinCode,
    });

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error('League not found');

    const league = data[0];

    return league;
  },

  async lockLeague(
    leagueId: string,
    reason: 'SUBSCRIPTION_EXPIRED' | 'FREE_LIMIT_EXCEEDED' | 'PRO_REQUIRED'
  ): Promise<void> {
    const { error } = await supabase
      .from('leagues')
      .update({ status: 'LOCKED', locked_reason: reason })
      .eq('id', leagueId);
    if (error) throw new Error(error.message);
  },

  async unlockLeague(leagueId: string): Promise<void> {
    const { error } = await supabase
      .from('leagues')
      .update({ status: 'ACTIVE', locked_reason: null })
      .eq('id', leagueId);
    if (error) throw new Error(error.message);
  },

  async getOwnedLeagues(userId: string) {
    const { data, error } = await supabase
      .from('leagues')
      .select('id, name, status, locked_reason, updated_at, competition:competitions(id, name, logo)')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
};
