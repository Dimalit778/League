import { useSubscriptionLimits as useAppSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { usePaywall, useRevenueCatSubscription } from '@/lib/revenuecat/purchases';
import { PLAN_LIMITS } from '@/lib/revenuecat/plans';

export const useSubscription = () => {
  const state = useRevenueCatSubscription();
  const plan = state.subscription.isActive ? 'PRO' : 'FREE';

  return {
    ...state,
    data: {
      type: plan,
      subscription_type: plan,
      limits: PLAN_LIMITS[plan],
    },
  };
};

export const usePurchaseAndSyncSubscription = () => {
  return usePaywall();
};

export const useSubscriptionLimit = () => {
  const limits = useAppSubscriptionLimits();

  return {
    limit: limits.maxLeagues,
    reachedLimit: limits.reachedLimit,
    usagePercent: limits.usagePercent,
    ownedLeaguesCount: limits.leaguesCount,
  };
};
