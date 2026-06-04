import { useSubscriptionLimits as useAppSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { usePaywall, useRevenueCatSubscription } from '@/lib/revenuecat/purchases';

export const useSubscription = () => {
  const state = useRevenueCatSubscription();

  return {
    ...state,
    data: {
      type: state.subscription.isActive ? 'PRO' : 'FREE',
      subscription_type: state.subscription.isActive ? 'PRO' : 'FREE',
      limits: state.subscription.isActive ? 'PRO' : 'FREE',
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
