import { supabase } from '@/lib/supabase';
import { subscriptionService } from '@/services/subscriptionService';
import { createLeagueParams, createLeagueResponse } from '@/types/league.types';

export const leagueService = {
  // GET user leagues - Used by useGetLeagues hook
  async getLeagues(userId: string) {
    const { data, error } = await supabase
      .from('league_members')
      .select('*, leagues!league_id(*,league_members(count))')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });

    if (error) throw new Error(error.message);

    return data;
  },

  // FIND league by join code - Used by useFindLeagueByJoinCode hook
  async findLeagueByJoinCode(joinCode: string) {
    const { data, error } = await supabase
      .from('leagues')
      .select(
        'id,name,join_code,max_members,owner_id,competitions!inner (id,name,logo,flag,country) ,league_members(count)'
      )
      .eq('join_code', joinCode)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('League not found');
    const league = {
      id: data.id,
      name: data.name,
      join_code: data.join_code,
      max_members: data.max_members,
      league_members: data.league_members[0].count,
      competition_id: data.competitions.id,
      logo: data.competitions.logo,
      country: data.competitions.country,
      flag: data.competitions.flag,
      owner_id: data.owner_id,
    };

    return league;
  },

  // GET full league and members by ID - Used by useGetFullLeagueData hook
  async getFullLeagueData(leagueId: string) {
    try {
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select(
          '*,competition:competitions!inner(id,name,logo,country,flag),league_members(count)'
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

  // GET full league including members list
  async getLeagueAndMembers(leagueId: string) {
    try {
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select(
          '*,competition:competitions!inner(id,name,logo,country,flag),league_members(*)'
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

  // CREATE league - Used internally by MemberStore
  async createLeague(params: createLeagueParams) {
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
        league_name: params.leagueName,
        max_members: maxMembers,
        competition_id: params.competition_id,
        logo: params.league_logo,
        nickname: params.nickname,
        avatar_url: '',
      }
    );

    if (error) throw new Error(error.message);

    return leagueData as createLeagueResponse;
  },

  // JOIN league - Used internally by MemberStore
  async joinLeague(joinCode: string, nickname: string, userId: string) {
    // First check if the league exists and get its details
    const league = await this.findLeagueByJoinCode(joinCode);

    // Check if the league is full
    if (league.league_members >= league.max_members) {
      throw new Error('This league is full and cannot accept new members.');
    }

    const { data, error } = await supabase.rpc('join_league', {
      league_join_code: joinCode,
      user_nickname: nickname,
      user_avatar_url: '',
    });

    if (error) throw new Error(error.message);

    return data;
  },

  // LEAVE league - Used internally by MemberStore
  async leaveLeague(leagueId: string) {
    const { data, error } = await supabase.rpc('leave_league', {
      p_league_id: leagueId,
    });
    if (error) throw new Error(error.message);

    return data;
  },

  // UPDATE primary league - Used internally by MemberStore
  async updatePrimaryLeague(userId: string, leagueId: string) {
    const { error } = await supabase
      .from('league_members')
      .update({
        is_primary: false,
      })
      .eq('user_id', userId);

    if (error) throw new Error(error.message);

    // Then set the selected league as primary and return with league data
    const { data: primaryLeague, error: primaryLeagueError } = await supabase
      .from('league_members')
      .update({
        is_primary: true,
      })
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .select('*, leagues!league_id(*)')
      .single();

    if (primaryLeagueError) throw new Error(primaryLeagueError.message);

    return primaryLeague;
  },

  // UPDATE league basic fields (e.g., name)
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

  // REMOVE member from league (owner only per RLS)
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
