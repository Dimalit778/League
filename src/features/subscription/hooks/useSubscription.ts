import { useMyLeagues } from '@/features/leagues/hooks/useLeagues';
import { useTranslation } from '@/hooks/useTranslation';
import { purchasesService } from '@/lib/revenuecat/purchases';
import { useAuthStore } from '@/store/AuthStore';
import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { getSubscriptionLimits, type SubscriptionPlan } from '../config/plans';
import type { SubscriptionLimits } from '../types';

const usePlan = (): SubscriptionPlan => {
  const isSubscribed = useAuthStore((s) => s.isSubscribed);
  return isSubscribed ? 'PRO' : 'FREE';
};

export const useSubscription = () => {
  const plan = usePlan();
  return {
    data: {
      type: plan,
      limits: getSubscriptionLimits(plan),
    },
    isLoading: false,
  };
};

export const useCanCreateLeague = () => {
  const plan = usePlan();
  const leagues = useMyLeagues();
  const limits = getSubscriptionLimits(plan);
  const leaguesCount = leagues.data?.length ?? 0;
  const canCreate = leaguesCount < limits.maxLeagues;

  return {
    data: {
      canCreate,
      reason: canCreate ? undefined : (`You've reached your limit of ${limits.maxLeagues} league${limits.maxLeagues === 1 ? '' : 's'}. Upgrade to create more.` as string | undefined),
    },
    isLoading: leagues.isPending,
  };
};

export const useSubscriptionLimit = (): SubscriptionLimits => {
  const plan = usePlan();
  const leagues = useMyLeagues();
  const limits = getSubscriptionLimits(plan);
  const leaguesCount = leagues.data?.length ?? 0;
  const reachedLimit = leaguesCount >= limits.maxLeagues;
  const usagePercent = limits.maxLeagues > 0 ? Math.min(100, (leaguesCount / limits.maxLeagues) * 100) : 0;

  return { limit: limits.maxLeagues, leaguesCount, reachedLimit, usagePercent };
};

export const usePurchaseAndSyncSubscription = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: () => purchasesService.presentPaywall(),
    onError: () => {
      Alert.alert(t('Error'), t('Something went wrong'));
    },
  });
};
