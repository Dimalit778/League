import { useMyLeagues } from '@/features/leagues/hooks/useLeagues';
import { PLAN_LIMITS } from '@/lib/revenuecat/plans';
import { useRevenueCatSubscription } from '@/lib/revenuecat/purchases';

export const useSubscriptionLimits = () => {
  const leaguesQuery = useMyLeagues();

  const subscriptionState = useRevenueCatSubscription();

  const isPro = subscriptionState.subscription.isActive;
  const plan = isPro ? 'PRO' : 'FREE';
  const limits = PLAN_LIMITS[plan];

 
  const totalLeagues = leaguesQuery.data?.total ?? 0;
  const maxLeagues = limits.maxLeagues;
  const reachedLimit = totalLeagues >= maxLeagues;
  const exceededLimit = totalLeagues > maxLeagues;
  const remainingLeagues = Math.max(0, maxLeagues - totalLeagues);
  const usagePercent =
    maxLeagues > 0 ? Math.min(100, (totalLeagues / maxLeagues) * 100) : 0;

  return {
    plan,
    isPro,
    subscription: subscriptionState.subscription,
    limits,
    totalLeagues,
    maxLeagues,
    reachedLimit,
    exceededLimit,
    remainingLeagues,
    usagePercent,
    isLoading: leaguesQuery.isPending || subscriptionState.isLoading,
    isFetching: leaguesQuery.isFetching,
    error: leaguesQuery.error ?? subscriptionState.error,
    refetchLeagues: leaguesQuery.refetch,
  };
};
