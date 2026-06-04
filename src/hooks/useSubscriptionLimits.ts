import { useMyLeagues } from '@/features/leagues/hooks/useLeagues';
import { PLAN_LIMITS } from '@/lib/revenuecat/plans';
import { useRevenueCatSubscription } from '@/lib/revenuecat/purchases';

export const useSubscriptionLimits = () => {
  const leaguesQuery = useMyLeagues();
  const subscriptionState = useRevenueCatSubscription();

  const isPro = subscriptionState.subscription.isActive;
  const plan = isPro ? 'PRO' : 'FREE';
  const limits = PLAN_LIMITS[plan];

  const leaguesCount = leaguesQuery.data?.length ?? 0;
  const maxLeagues = limits.maxLeagues;
  const reachedLimit = leaguesCount >= maxLeagues;
  const remainingLeagues = Math.max(0, maxLeagues - leaguesCount);
  const usagePercent =
    maxLeagues > 0 ? Math.min(100, (leaguesCount / maxLeagues) * 100) : 0;

  return {
    plan,
    isPro,
    subscription: subscriptionState.subscription,
    limits,
    leaguesCount,
    maxLeagues,
    reachedLimit,
    remainingLeagues,
    usagePercent,
    isLoading: leaguesQuery.isPending || subscriptionState.isLoading,
    isFetching: leaguesQuery.isFetching,
    error: leaguesQuery.error ?? subscriptionState.error,
    refetchLeagues: leaguesQuery.refetch,
  };
};