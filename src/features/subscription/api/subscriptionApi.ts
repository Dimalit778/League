import { supabase } from '@/lib/supabase';
import type { PurchaseSyncPayload } from '@/lib/revenuecat/purchases';
import {
  getSubscriptionLimits,
  normalizeSubscriptionPlan,
  type SubscriptionPlan,
} from '../config/plans';
import { canCreateLeague as canCreateLeagueGuard } from '../utils/subscriptionGuards';
import type { CurrentSubscription } from '../types';

const DEFAULT_PLAN: SubscriptionPlan = 'FREE';

export const subscriptionApi = {
  getSubscriptionLimits,

  async getCurrentSubscription(userId: string): Promise<CurrentSubscription> {
    const { data, error } = await supabase
      .from('subscription')
      .select(
        'type, start_date, end_date, product_id, transaction_id',
      )
      .eq('user_id', userId)
      .gte('end_date', new Date().toISOString())
      .order('end_date', { ascending: false })
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    const plan = data?.type
      ? normalizeSubscriptionPlan(data.type)
      : DEFAULT_PLAN;
    const limits = getSubscriptionLimits(plan);

    return {
      type: plan,
      start_date: data?.start_date ?? null,
      end_date: data?.end_date ?? null,
      product_id: data?.product_id ?? null,
      transaction_id: data?.transaction_id ?? null,
      limits,
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

  async canCreateLeague(
    userId: string,
  ): Promise<{ canCreate: boolean; reason?: string }> {
    const result = await canCreateLeagueGuard(userId);
    return { canCreate: result.allowed, reason: result.reason };
  },

  async syncAfterPurchase(
    userId: string,
    payload: PurchaseSyncPayload,
  ): Promise<void> {
    const { error } = await supabase.from('subscription').upsert(
      {
        user_id: userId,
        type: payload.type,
        start_date: payload.start_date,
        end_date: payload.end_date,
        product_id: payload.product_id,
      },
      { onConflict: 'user_id' },
    );

    if (error) {
      throw new Error(error.message);
    }
  },
};
