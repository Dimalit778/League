import { useMyLeagues } from '@/features/leagues/hooks/useLeagues';
import { useSubscriptionAccess } from '@/features/subscription/hooks/useSubscriptionAccess';

export const useSubscriptionLimits = () => {
  const leaguesQuery = useMyLeagues();
  const accessQuery = useSubscriptionAccess();

  const isPro = accessQuery.data?.planCode === 'pro';
  const plan = isPro ? 'PRO' : 'FREE';
  const limits = accessQuery.data?.limits;
  const totalLeagues = leaguesQuery.data?.total ?? 0;
  const maxLeagues = limits?.maxActiveLeagues ?? 0;
  const reachedLimit = totalLeagues >= maxLeagues;
  const exceededLimit = totalLeagues > maxLeagues;
  const remainingLeagues = Math.max(0, maxLeagues - totalLeagues);
  const usagePercent =
    maxLeagues > 0 ? Math.min(100, (totalLeagues / maxLeagues) * 100) : 0;

  return {
    plan,
    isPro,
    limits,
    totalLeagues,
    maxLeagues,
    reachedLimit,
    exceededLimit,
    remainingLeagues,
    usagePercent,
    isLoading: leaguesQuery.isPending || accessQuery.isPending,
    isFetching: leaguesQuery.isFetching || accessQuery.isFetching,
    error: leaguesQuery.error ?? accessQuery.error,
    refetchLeagues: leaguesQuery.refetch,
  };
};
