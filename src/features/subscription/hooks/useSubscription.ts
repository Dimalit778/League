import { useMyLeagues } from '@/features/leagues/hooks/useLeagues';
import { MyLeagueType } from '@/features/leagues/types';
import { useTranslation } from '@/hooks/useTranslation';
import { KEYS } from '@/lib/queryClient';
import { purchasesService } from '@/lib/revenuecat/purchases';
import { useAuthStore } from '@/store/AuthStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { subscriptionApi } from '../api/subscriptionApi';
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

/** Reconcile RevenueCat billing state into Supabase once per session. */
export const useSyncSubscriptionFromRevenueCat = () => {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: userId
      ? KEYS.subscriptions.revenueCatSync(userId)
      : (['subscriptions', 'unknown', 'revenuecat-sync'] as const),
    enabled: !!userId,
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

export type SubscriptionLeaguesLimitState = {
  limit: number;
  ownedLeagues: MyLeagueType[];
  ownedLeaguesCount: number;
  leaguesList: MyLeagueType[];
  leaguesCount: number;
  hasLockedMembership: boolean;
  hasSubscriptionExpiredLock: boolean;
  reachedLimit: boolean;
  needsResolution: boolean;
  usagePercent: number;
  isLoading: boolean;
  isFetching: boolean;
};

export const useCheckSubscriptionLeaguesLimit = (): SubscriptionLeaguesLimitState => {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const subscription = useSubscription();
  const leagues = useMyLeagues();
  const leaguesList = leagues.data ?? [];
  const ownedLeagues = userId ? leaguesList.filter((item) => item.league.owner_id === userId) : [];
  const limits = subscription.data?.limits ?? getSubscriptionLimits('FREE');
  const activeOwnedLeaguesCount = ownedLeagues.filter((item) => item.active).length;
  const hasLockedMembership = leaguesList.some((item) => !item.active);
  const hasSubscriptionExpiredLock = !isPaidPlan(subscription.data?.type ?? 'FREE') && hasLockedMembership;
  const reachedLimit = activeOwnedLeaguesCount >= limits.maxLeagues;
  const needsResolution = !isPaidPlan(subscription.data?.type ?? 'FREE') && ownedLeagues.length > limits.maxLeagues;

  return {
    limit: limits.maxLeagues,
    ownedLeagues,
    ownedLeaguesCount: ownedLeagues.length,
    leaguesList,
    leaguesCount: activeOwnedLeaguesCount,
    hasLockedMembership,
    hasSubscriptionExpiredLock,
    reachedLimit,
    needsResolution,
    usagePercent: limits.maxLeagues > 0 ? Math.min(100, (activeOwnedLeaguesCount / limits.maxLeagues) * 100) : 0,
    isLoading: subscription.isLoading || leagues.isLoading,
    isFetching: subscription.isFetching || leagues.isFetching,
  };
};

export const usePurchaseAndSyncSubscription = () => {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async () => {
      const payload = await purchasesService.presentPaywall();
      if (payload && userId) {
        await subscriptionApi.syncAfterPurchase(userId, payload);
      }
      return payload;
    },
    onSuccess: async () => {
      if (!userId) return;

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: KEYS.subscriptions.detail(userId),
        }),
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
