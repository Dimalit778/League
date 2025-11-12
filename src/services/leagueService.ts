import { supabase } from '@/lib/supabase';
import { subscriptionService } from '@/services/subscriptionService';
import {
  createLeagueProps,
  createLeagueResponse,
  LeagueWithCompetition,
  leagueWithMembers,
  MemberLeague,
} from '@/types';

export const leagueService = {
  async getLeagueLeaderboard(leagueId: string) {
    const { data, error } = await supabase
      .from('league_leaderboard_view')
      .select('*')
      .eq('league_id', leagueId);

    if (error) throw error;
    return data;
  },
  async getUserLeagues(userId: string): Promise<MemberLeague[]> {
    const { data, error } = await supabase
      .from('league_members')
      .select('*, league:leagues!league_id(*,competition:competitions(*))')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });

    if (error) throw new Error(error.message);

    return data as MemberLeague[];
  },

  async findLeagueByJoinCode(joinCode: string): Promise<LeagueWithCompetition> {
    const { data, error } = await supabase
      .from('leagues')
      .select('*,competition:competitions(*)')
      .eq('join_code', joinCode)
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('League not found');

    return data as LeagueWithCompetition;
  },

  async getLeagueAndMembers(leagueId: string): Promise<leagueWithMembers> {
    try {
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select(
          '*,competition:competitions!inner(id,name,logo,area,flag),league_members(*)'
        )
        .eq('id', leagueId)
        .single();

      if (leagueError) throw new Error(leagueError.message);

      return leagueData as leagueWithMembers;
    } catch (error: any) {
      console.error('Error in getLeagueAndMembers:', error.message);
      throw error;
    }
  },

  async createLeague(params: createLeagueProps): Promise<createLeagueResponse> {
    const { canCreate, reason } = await subscriptionService.canCreateLeague(
      params.user_id
    );

    if (!canCreate) {
      throw new Error(
        reason ||
          "You've reached your league limit. Please upgrade your subscription."
      );
    }

    // Get subscription to determine max members allowed
    const subscription = await subscriptionService.getCurrentSubscription(
      params.user_id
    );
    const limits = subscriptionService.getSubscriptionLimits(
      subscription?.subscription_type || 'FREE'
    );
    // Ensure max_members doesn't exceed subscription limit
    const maxMembers = Math.min(params.max_members, limits.maxMembersPerLeague);

    const { data: leagueData, error } = await supabase.rpc(
      'create_new_league',
      {
        league_name: params.league_name,
        max_members: maxMembers,
        competition_id: params.competition_id,
        nickname: params.nickname,
        avatar_url: '',
      }
    );

    if (error) throw new Error(error.message);

    return leagueData as createLeagueResponse;
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

  async updatePrimaryLeague(
    userId: string,
    leagueId: string
  ): Promise<MemberLeague> {
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

    return primaryLeague as MemberLeague;
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
    const { error } = await supabase
      .from('league_members')
      .delete()
      .eq('league_id', leagueId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return true;
  },
};
