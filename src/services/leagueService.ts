import { supabase } from '@/lib/supabase';
import { subscriptionService } from '@/services/subscriptionService';
import {
  createLeagueProps,
  createLeagueResponse,
  LeagueWithCompetition,
  MemberLeague,
} from '@/types';

export const leagueService = {
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

  async getFullLeagueData(leagueId: string) {
    try {
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select(
          '*,competition:competitions!inner(id,name,logo,area,flag),league_members(count)'
        )
        .eq('id', leagueId)
        .single();

      if (leagueError) throw new Error(leagueError.message);
      if (!leagueData) throw new Error('League not found');

      const { data: ownerData, error: ownerError } = await supabase
        .from('league_members')
        .select('nickname')
        .eq('user_id', leagueData.owner_id)
        .eq('league_id', leagueId)
        .single();

      if (ownerError)
        return console.error('Error fetching owner data:', ownerError);

      return {
        ...leagueData,
        owner: ownerData,
      };
    } catch (error: any) {
      console.error('Error in getFullLeagueData:', error.message);
      throw error;
    }
  },

  async getLeagueAndMembers(leagueId: string) {
    try {
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select(
          '*,competition:competitions!inner(id,name,logo,area,flag),league_members(*)'
        )
        .eq('id', leagueId)
        .single();

      if (leagueError) throw new Error(leagueError.message);
      if (!leagueData) throw new Error('League not found');
      const { data: owner, error: ownerError } = await supabase
        .from('league_members')
        .select('*')
        .eq('league_id', leagueId)
        .eq('user_id', leagueData.owner_id)
        .single();
      if (ownerError) throw new Error(ownerError.message);
      if (!owner) throw new Error('Owner not found');

      return {
        ...leagueData,
        owner,
      };
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
    // First check if the league exists and get its details
    const league = await this.findLeagueByJoinCode(joinCode);

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

    const { error: unsetLeaguesError } = await supabase
      .from('league_members')
      .update({ is_primary: false })
      .eq('user_id', userId)
      .neq('league_id', leagueId);

    if (unsetLeaguesError) throw new Error(unsetLeaguesError.message);

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
