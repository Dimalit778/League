import { useMyLeagues } from '@/features/leagues/hooks/useLeagues';
import { useTranslation } from '@/hooks/useTranslation';
import { KEYS } from '@/lib/queryClient';
import { purchasesService } from '@/lib/revenuecat/purchases';
import { usePurchasesContext } from '@/providers/PurchasesProvider';
import { useAuthStore } from '@/store/AuthStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { subscriptionApi } from '../api/subscriptionApi';
import { SubscriptionLimits } from '../types';
import { getSubscriptionLimits, isPaidPlan } from '../utils/getSubscriptionLimits';

export const useSubscription = () => {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: userId ? KEYS.subscriptions.detail(userId) : (['subscriptions', 'unknown'] as const),
    queryFn: () => subscriptionApi.getCurrentSubscription(userId as string),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCanCreateLeague = () => {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: userId
      ? KEYS.subscriptions.canCreateLeague(userId)
      : (['subscriptions', 'unknown', 'canCreateLeague'] as const),
    queryFn: () => {
      if (!userId) {
        throw new Error('User id is required to check league creation capability');
      }
      return subscriptionApi.canCreateLeague(userId);
    },
    enabled: !!userId,
    staleTime: 60 * 1000 * 5,
  });
};
export const useSubscriptionLimit = (): SubscriptionLimits => {
  const subscription = useSubscription();
  const leagues = useMyLeagues();

  const limits = subscription.data?.limits ?? getSubscriptionLimits('FREE');
  const leaguesCount = leagues.data?.length ?? 0;

  const reachedLimit = leaguesCount >= limits.maxLeagues;
  const usagePercent = limits.maxLeagues > 0 ? Math.min(100, (leaguesCount / limits.maxLeagues) * 100) : 0;

  return {
    limit: limits.maxLeagues,
    leaguesCount,
    reachedLimit,
    usagePercent,
  };
};

/** Reconcile RevenueCat billing state into Supabase once per session. */
export const useSyncSubscriptionFromRevenueCat = () => {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const { isReady, isUserSynced } = usePurchasesContext();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: userId
      ? KEYS.subscriptions.revenueCatSync(userId)
      : (['subscriptions', 'unknown', 'revenuecat-sync'] as const),
    enabled: !!userId && isReady && isUserSynced,
    staleTime: 1000 * 60 * 5,
    retry: false,
    queryFn: async () => {
      if (!userId) {
        throw new Error('User id is required to sync subscription');
      }

      let payload = null;
      try {
        payload = await purchasesService.getActiveSyncPayload();
      } catch {
        return { synced: false as const };
      }

      const subscription = await subscriptionApi.getCurrentSubscription(userId);
      const rcActive = !!payload;
      const dbPaid = isPaidPlan(subscription?.type ?? 'FREE');

      if (rcActive && !dbPaid && payload) {
        await subscriptionApi.syncAfterPurchase(userId, payload);
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: KEYS.subscriptions.detail(userId),
          }),
          queryClient.invalidateQueries({
            queryKey: KEYS.subscriptions.canCreateLeague(userId),
          }),
          queryClient.invalidateQueries({
            queryKey: KEYS.users.leagues(userId),
          }),
        ]);
        return { synced: true as const };
      }

      return { synced: false as const, rcActive, dbPaid };
    },
  });
};

export const usePurchaseAndSyncSubscription = () => {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async () => {
      const paywallPayload = await purchasesService.presentPaywall();
      let syncPayload = paywallPayload;

      if (!syncPayload) {
        syncPayload = await purchasesService.getActiveSyncPayload();
      }

      if (syncPayload && userId) {
        await subscriptionApi.syncAfterPurchase(userId, syncPayload);
      }

      return syncPayload;
    },
    onSuccess: async (payload) => {
      if (!userId || !payload) return;

      const subscription = await subscriptionApi.getCurrentSubscription(userId);
      queryClient.setQueryData(KEYS.subscriptions.detail(userId), subscription);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: KEYS.subscriptions.revenueCatSync(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: KEYS.subscriptions.canCreateLeague(userId),
        }),
        queryClient.invalidateQueries({ queryKey: KEYS.users.leagues(userId) }),
      ]);
    },
    onError: () => {
      Alert.alert(t('Error'), t('Something went wrong'));
    },
  });
};
