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

  async canCreateLeague(userId: string): Promise<{ canCreate: boolean; reason?: string }> {
    try {
      const [subscription, leagueCount] = await Promise.all([
        this.getCurrentSubscription(userId),
        this.getUserLeagueCount(userId),
      ]);

      const subscriptionType = subscription?.subscription_type || 'FREE';
      const limits = getSubscriptionLimits(subscriptionType);

      if (leagueCount >= limits.maxLeagues) {
        return {
          canCreate: false,
          reason: `You've reached your limit of ${limits.maxLeagues} league${limits.maxLeagues === 1 ? '' : 's'}. Upgrade to Pro to create or join more leagues.`,
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
