import { syncSubscriptionToServerUntilPro } from '@/features/subscription/api/subscriptionApi';
import { KEYS } from '@/lib/queryClient';
import { useChampoPaywall } from '@/providers/PaywallProvider';
import { usePurchasesContext } from '@/providers/PurchasesProvider';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import { getSubscriptionSummary } from './customerInfoSummary';

const syncSubscriptionAfterChange = async (): Promise<boolean> => {
  try {
    const result = await syncSubscriptionToServerUntilPro();
    return result?.plan === 'pro';
  } catch (error) {
    console.warn('[RevenueCat] Server subscription sync failed:', error);
    return false;
  }
};

export const usePaywall = () => {
  const { refreshCustomerInfo } = usePurchasesContext();
  const presentPaywall = useChampoPaywall();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    const result = await presentPaywall();

    if (result === 'restored') return true;

    if (result === 'purchased') {
      const [, synced] = await Promise.all([
        refreshCustomerInfo(),
        syncSubscriptionAfterChange(),
      ]);
      if (synced) {
        await queryClient.invalidateQueries({ queryKey: KEYS.subscription.accessAll });
      }
      return synced;
    }

    return false;
  }, [presentPaywall, queryClient, refreshCustomerInfo]);
};

export const useRestorePurchases = () => {
  const { refreshCustomerInfo } = usePurchasesContext();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    if (Platform.OS === 'web') {
      return false;
    }

    await Purchases.restorePurchases();
    await Purchases.invalidateCustomerInfoCache();

    const [, synced] = await Promise.all([
      refreshCustomerInfo(),
      syncSubscriptionAfterChange(),
    ]);
    if (synced) {
      await queryClient.invalidateQueries({ queryKey: KEYS.subscription.accessAll });
    }
    return synced;
  }, [queryClient, refreshCustomerInfo]);
};

export const useRevenueCatSubscription = () => {
  const { customerInfo, isReady, isUserSynced, isOffline, error, refreshCustomerInfo } =
    usePurchasesContext();

  const subscription = useMemo(
    () => getSubscriptionSummary(customerInfo),
    [customerInfo],
  );

  const isSubscriptionKnown = isUserSynced && (!isOffline || customerInfo !== null);

  return {
    customerInfo,
    subscription,
    isSubscribed: isUserSynced && subscription.isActive,
    isOffline,
    isSubscriptionKnown,
    isLoading: !isReady || (!isUserSynced && !isOffline),
    error,
    refreshCustomerInfo,
  };
};
