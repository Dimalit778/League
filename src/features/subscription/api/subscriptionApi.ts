import type { PurchaseSyncPayload } from '@/lib/revenuecat/purchases';
import { supabase } from '@/lib/supabase';
import {
  getSubscriptionLimits,
  normalizeSubscriptionPlan,
  type SubscriptionPlan,
  type SubscriptionPlanInput,
} from '../config/plans';
import type { CurrentSubscription } from '../types';
import { canCreateLeague as canCreateLeagueGuard } from '../utils/subscriptionGuards';

export const subscriptionApi = {
  getSubscriptionLimits,

  async getCurrentSubscription(userId: string): Promise<CurrentSubscription> {
    const { data, error } = await supabase
      .from('subscription')
      .select('type, start_date, end_date, product_id, transaction_id')
      .eq('user_id', userId)
      .gte('end_date', new Date().toISOString())
      .order('end_date', { ascending: false })
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    const plan = normalizeSubscriptionPlan(data?.type as SubscriptionPlanInput);

    return {
      type: plan,
      start_date: data?.start_date ?? null,
      end_date: data?.end_date ?? null,
      product_id: data?.product_id ?? null,
      transaction_id: data?.transaction_id ?? null,
      limits: getSubscriptionLimits(plan),
    };
  },

  async getUserLeaguesCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('leagues')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('status', 'ACTIVE');

    if (error) {
      throw new Error(error.message);
    }

    return count ?? 0;
  },

  async getUserSubscriptionPlan(userId: string): Promise<SubscriptionPlan> {
    const subscription = await this.getCurrentSubscription(userId);
    return subscription.type;
  },

  async canCreateLeague(userId: string): Promise<{ canCreate: boolean; reason?: string }> {
    const result = await canCreateLeagueGuard(userId);
    return { canCreate: result.allowed, reason: result.reason };
  },

  async syncAfterPurchase(userId: string, payload: PurchaseSyncPayload): Promise<void> {
    const { error } = await supabase.rpc('sync_subscription_from_revenuecat', {
      p_start_date: payload.start_date,
      p_end_date: payload.end_date,
      p_product_id: payload.product_id ?? undefined,
      p_transaction_id: undefined,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!userId) return;
  },
};
