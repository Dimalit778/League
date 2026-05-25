import { supabase } from '@/lib/supabase';
import { SubscriptionDetailsWithLimits } from '../types';
import { getDefaultFreeSubscription, getSubscriptionLimits } from '../utils/getSubscriptionLimits';

export const subscriptionApi = {
  getSubscriptionLimits,
  getDefaultFreeSubscription,

  async getCurrentSubscription(userId: string): Promise<SubscriptionDetailsWithLimits | null> {
    const { data, error } = await supabase
      .from('subscription')
      .select('*')
      .eq('user_id', userId)
      .gte('end_date', new Date().toISOString())
      .order('end_date', { ascending: false })
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (!data) {
      const defaultSub = getDefaultFreeSubscription(userId);
      return { ...defaultSub, limits: getSubscriptionLimits('FREE') };
    }
    const limits = getSubscriptionLimits(data.subscription_type);
    return { ...data, limits };
  },

  async getUserLeagueCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('league_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return count || 0;
  },

  async getUserOwnedLeagueCount(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('leagues')
      .select('id')
      .eq('owner_id', userId)
      .eq('status', 'ACTIVE');
    if (error) throw new Error(error.message);
    return data?.length ?? 0;
  },

  async canCreateLeague(userId: string): Promise<{ canCreate: boolean; reason?: string }> {
    try {
      const subscription = await this.getCurrentSubscription(userId);
      const subscriptionType = subscription?.subscription_type || 'FREE';
      const limits = getSubscriptionLimits(subscriptionType);

      const { data: ownedLeagues, error: leagueError } = await supabase
        .from('leagues')
        .select('id')
        .eq('owner_id', userId)
        .eq('status', 'ACTIVE');

      if (leagueError) throw new Error(leagueError.message);
      const leagueCount = ownedLeagues?.length ?? 0;

      if (leagueCount >= limits.ownedLeagues) {
        return {
          canCreate: false,
          reason: `You've reached your limit of ${limits.ownedLeagues} custom league${limits.ownedLeagues === 1 ? '' : 's'}. Upgrade to Pro to create or join more leagues.`,
        };
      }

      return { canCreate: true };
    } catch {
      return {
        canCreate: false,
        reason: 'An error occurred while checking subscription status.',
      };
    }
  },
};
