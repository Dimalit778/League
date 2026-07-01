import { supabase } from '@/lib/supabase';
import { LeaderboardRow, LeagueDetailsType, LeagueWithCompetitionType, MyLeagueType, MyLeaguesResponseType } from '../types';

const LEADERBOARD_SELECT = 'avatar_url, league_id, member_id, nickname, total_points, user_id';
const COMPETITION_SELECT = 'id, name, logo, area, flag';
const MY_LEAGUES_SELECT = `
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
    competition:competitions(${COMPETITION_SELECT})
  )
`;
const LEAGUE_WITH_COMPETITION_SELECT = `
  competition_id,
  created_at,
  id,
  join_code,
  max_members,
  name,
  owner_id,
  updated_at,
  competition:competitions(${COMPETITION_SELECT})
`;
const LEAGUE_WITH_MEMBERS_SELECT = `
  ${LEAGUE_WITH_COMPETITION_SELECT},
  league_members(
    active,
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

    const rows = (data ?? []) as LeaderboardRow[];
    if (rows.length === 0) return rows;

    const memberIds = rows.map((row) => row.member_id).filter((id): id is string => !!id);
    const { data: predictions, error: predictionsError } = await supabase
      .from('predictions')
      .select('league_member_id')
      .in('league_member_id', memberIds)
      .eq('is_finished', true)
      .eq('points', 5);

    if (predictionsError) throw predictionsError;

    const correctScoreCounts = new Map<string, number>();
    for (const prediction of predictions ?? []) {
      const memberId = prediction.league_member_id;
      correctScoreCounts.set(memberId, (correctScoreCounts.get(memberId) ?? 0) + 1);
    }

    return rows.map((row) => ({
      ...row,
      correct_scores: row.member_id ? (correctScoreCounts.get(row.member_id) ?? 0) : 0,
    }));
  },
  async getMyLeagues(userId: string): Promise<MyLeaguesResponseType> {
    const { data, error } = await supabase
      .from('league_members')
      .select(MY_LEAGUES_SELECT)
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
      .order('active', { ascending: false });

    if (error) throw new Error(error.message);

    const memberships = (data ?? []) as MyLeagueType[];

    return {
      primaryLeague: memberships.find((league) => league.is_primary) ?? null,
      leagues: memberships.filter((league) => !league.is_primary && league.active),
      inactiveLeagues: memberships.filter((league) => !league.is_primary && !league.active),
      totalLeagues: memberships.length,
    };
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

  async updateMyLeagueActivation(userId: string, activeMemberIds: string[]) {
    const { data: memberships, error: membershipsError } = await supabase
      .from('league_members')
      .select('id, league_id, active, is_primary')
      .eq('user_id', userId);

    if (membershipsError) throw new Error(membershipsError.message);

    const selectedIds = new Set(activeMemberIds);
    const invalidSelection = activeMemberIds.some((memberId) => !memberships?.some((member) => member.id === memberId));
    if (invalidSelection) throw new Error('Invalid league selection');

    const idsToActivate = (memberships ?? [])
      .filter((member) => selectedIds.has(member.id) && !member.active)
      .map((member) => member.id);
    const idsToDeactivate = (memberships ?? [])
      .filter((member) => !selectedIds.has(member.id) && member.active)
      .map((member) => member.id);

    if (idsToDeactivate.length > 0) {
      const { error } = await supabase
        .from('league_members')
        .update({ active: false, is_primary: false })
        .eq('user_id', userId)
        .in('id', idsToDeactivate);

      if (error) throw new Error(error.message);
    }

    if (idsToActivate.length > 0) {
      const { error } = await supabase
        .from('league_members')
        .update({ active: true })
        .eq('user_id', userId)
        .in('id', idsToActivate);

      if (error) throw new Error(error.message);
    }

    const selectedPrimary = (memberships ?? []).find((member) => member.is_primary && selectedIds.has(member.id));
    const fallbackPrimary = (memberships ?? []).find((member) => selectedIds.has(member.id));

    if (!selectedPrimary && fallbackPrimary) {
      await this.updatePrimaryLeague(fallbackPrimary.league_id);
    }

    return {
      primaryLeagueId: selectedPrimary?.league_id ?? fallbackPrimary?.league_id ?? null,
    };
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

  async findLeagueByJoinCode(joinCode: string) {
    const { data, error } = await supabase.rpc('find_league_by_code', {
      p_join_code: joinCode,
    });

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error('League not found');

    const league = data[0];

    return league;
  },

  async getOwnedLeagues(userId: string) {
    const { data, error } = await supabase
      .from('leagues')
      .select('id, name, updated_at, competition:competitions(id, name, logo)')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async deleteLeague(leagueId: string) {
    const { data, error } = await supabase.rpc('delete_owned_league', {
      p_league_id: leagueId,
    });

    if (error) throw new Error(error.message || 'Failed to delete league');
    if (!data) throw new Error('Failed to delete league');

    return data;
  },
};
