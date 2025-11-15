import { supabase } from '@/lib/supabase';
import { SubscriptionDetails, SubscriptionLimits, SubscriptionType } from '../types';

export const subscriptionApi = {
  getSubscriptionLimits(subscriptionType: SubscriptionType | null): SubscriptionLimits {
    switch (subscriptionType) {
      case 'PREMIUM':
        return {
          maxLeagues: 5,
          maxMembersPerLeague: 10,
        };
      case 'BASIC':
        return {
          maxLeagues: 3,
          maxMembersPerLeague: 8,
        };
      case 'FREE':
      default:
        return {
          maxLeagues: 2,
          maxMembersPerLeague: 6,
        };
    }
  },
  getDefaultFreeSubscription(userId: string): SubscriptionDetails {
    // Create a virtual FREE subscription that isn't stored in the database
    return {
      id: 'free-' + userId,
      user_id: userId,
      subscription_type: 'FREE',
      start_date: new Date().toISOString(),
      end_date: new Date(2099, 11, 31).toISOString(), // Far future date
      access_advanced_stats: false,
      can_add_members: false,
    };
  },

  async getCurrentSubscription(userId: string): Promise<SubscriptionDetails | null> {
    const { data, error } = await supabase
      .from('subscription')
      .select('*')
      .eq('user_id', userId)
      .gte('end_date', new Date().toISOString())
      .order('end_date', { ascending: false })
      .maybeSingle();

    if (error) throw new Error(error.message);

    // If no subscription found in database, return default FREE subscription
    if (!data) {
      return this.getDefaultFreeSubscription(userId);
    }

    return data;
  },

  async createSubscription(
    userId: string,
    subscriptionType: SubscriptionType,
    startDate: Date = new Date(),
    endDate: Date = new Date(new Date().setMonth(new Date().getMonth() + 1))
  ) {
    // For FREE subscription, just return the default virtual subscription without saving to database
    if (subscriptionType === 'FREE') {
      return this.getDefaultFreeSubscription(userId);
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
        can_add_members: subscriptionType === 'PREMIUM',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
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
      .from('leagues')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId);

    if (error) throw new Error(error.message);
    return count || 0;
  },

  async canCreateLeague(userId: string): Promise<{ canCreate: boolean; reason?: string }> {
    try {
      // Get current subscription (will return default FREE if none exists)
      const subscription = await this.getCurrentSubscription(userId);

      // This should never be null due to our default FREE subscription
      const subscriptionType = subscription?.subscription_type || 'FREE';
      const limits = this.getSubscriptionLimits(subscriptionType);

      const leagueCount = await this.getUserLeagueCount(userId);

      if (leagueCount >= limits.maxLeagues) {
        return {
          canCreate: false,
          reason: `You've reached your limit of ${limits.maxLeagues} leagues. Upgrade your subscription to create more leagues.`,
        };
      }

      return { canCreate: true };
    } catch (error) {
      console.error('Error checking if user can create league:', error);
      return {
        canCreate: false,
        reason: 'An error occurred while checking subscription status.',
      };
    }
  },
};
