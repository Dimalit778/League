import { supabase } from '@/lib/supabase';
import { StripePaymentSetup, SubscriptionDetailsWithLimits, SubscriptionType } from '../types';
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

  async createSubscription(
    userId: string,
    subscriptionType: SubscriptionType,
    startDate: Date = new Date(),
    endDate: Date = new Date(new Date().setMonth(new Date().getMonth() + 1))
  ) {
    // For FREE subscription, just return the default virtual subscription without saving to database
    if (subscriptionType === 'FREE') {
      return getDefaultFreeSubscription(userId);
    }

    // For paid subscriptions (BASIC, PREMIUM), save to database
    const { data, error } = await supabase
      .from('subscription')
      .insert({
        user_id: userId,
        subscription_type: subscriptionType,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        access_advanced_stats: true,
        can_add_members: true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async createStripeSubscription(): Promise<StripePaymentSetup> {
    const { data, error } = await supabase.functions.invoke('create-stripe-subscription');
    if (error) throw new Error(error.message);
    return data as StripePaymentSetup;
  },

  async cancelSubscription(subscriptionId: string) {
    // Set end date to current date to effectively cancel the subscription
    const { data, error } = await supabase
      .from('subscription')
      .update({
        end_date: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
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
      // Get current subscription (will return default FREE if none exists)
      const subscription = await this.getCurrentSubscription(userId);

      // This should never be null due to our default FREE subscription
      const subscriptionType = subscription?.subscription_type || 'FREE';
      const limits = getSubscriptionLimits(subscriptionType);

      const leagueCount = await this.getUserLeagueCount(userId);
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
