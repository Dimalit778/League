import { PurchaseSyncPayload } from '@/lib/revenuecat/purchases';
import { supabase } from '@/lib/supabase';
import { SubscriptionDetailsWithLimits } from '../types';
import { getDefaultFreeSubscription, getSubscriptionLimits } from '../utils/getSubscriptionLimits';

export const subscriptionApi = {
  getSubscriptionLimits,
  getDefaultFreeSubscription,

  async syncAfterPurchase(userId: string, payload: PurchaseSyncPayload): Promise<void> {
    const { error } = await supabase
      .from('subscription')
      .upsert({ ...payload, user_id: userId }, { onConflict: 'user_id' });
    if (error) throw new Error(error.message);
  },

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
    const { canCreateLeague } = await import('@/features/subscription/utils/subscriptionGuards');
    const result = await canCreateLeague(userId);
    return { canCreate: result.allowed, reason: result.reason };
  },
};
