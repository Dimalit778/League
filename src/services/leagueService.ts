import { supabase } from '@/lib/supabase';
import { subscriptionService } from '@/services/subscriptionService';

export const leagueService = {
  async getLeagueLeaderboard(leagueId: string) {
    const { data, error } = await supabase.from('league_leaderboard_view').select('*').eq('league_id', leagueId);

    if (error) throw error;
    return data;
  },
  async getUserLeagues(userId: string) {
    const { data, error } = await supabase
      .from('league_members')
      .select('*, league:leagues!league_id(*,competition:competitions(*))')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });

    if (error) throw new Error(error.message);

    return data;
  },

  async findLeagueByJoinCode(joinCode: string) {
    const { data, error } = await supabase
      .from('leagues')
      .select('*,competition:competitions(*)')
      .eq('join_code', joinCode)
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('League not found');

    return data;
  },

  async getLeagueAndMembers(leagueId: string) {
    const { data: leagueData, error: leagueError } = await supabase
      .from('leagues')
      .select('*,competition:competitions!inner(id,name,logo,area,flag),league_members(*)')
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

  async createLeague(params: {
    league_name: string;
    max_members: number;
    competition_id: number;
    nickname: string;
    user_id: string;
  }) {
    const { canCreate, reason } = await subscriptionService.canCreateLeague(params.user_id);

    if (!canCreate) {
      throw new Error(reason || "You've reached your league limit. Please upgrade your subscription.");
    }

    const subscription = await subscriptionService.getCurrentSubscription(params.user_id);
    const limits = subscriptionService.getSubscriptionLimits(subscription?.subscription_type || 'FREE');

    const maxMembers = Math.min(params.max_members, limits.maxMembersPerLeague);

    const { data: leagueData, error } = await supabase.rpc('create_new_league', {
      league_name: params.league_name,
      max_members: maxMembers,
      competition_id: params.competition_id,
      nickname: params.nickname,
      avatar_url: undefined,
    });

    if (error) throw new Error(error.message);

    return leagueData;
  },

  async joinLeague(joinCode: string, nickname: string) {
    const { data, error } = await supabase.rpc('join_league', {
      league_join_code: joinCode,
      user_nickname: nickname,
    });

    if (error) throw new Error(error.message);

    return data;
  },

  async leaveLeague(leagueId: string) {
    const { data, error } = await supabase.rpc('leave_league', {
      p_league_id: leagueId,
    });
    if (error) throw new Error(error.message);

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
      .select('*, league:leagues!league_id(*,competition:competitions(*))')
      .single();

    if (setPrimaryError) throw new Error(setPrimaryError.message);

    return primaryLeague;
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

  async removeMember(leagueId: string, userId: string) {
    const { error } = await supabase.from('league_members').delete().eq('league_id', leagueId).eq('user_id', userId);
    if (error) throw new Error(error.message);
    return true;
  },
};
