import { syncSubscriptionToServerUntilPro } from '@/features/subscription/api/subscriptionApi';
import { useChampoPaywall } from '@/providers/PaywallProvider';
import { usePurchasesContext } from '@/providers/PurchasesProvider';
import { useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import {
  getSubscriptionSummary,
  hasActiveEntitlement,
  PRO_ENTITLEMENT,
} from './customerInfoSummary';

const syncSubscriptionAfterChange = async (): Promise<boolean> => {
  try {
    const result = await syncSubscriptionToServerUntilPro();
    return result?.plan === 'pro';
  } catch (error) {
    console.warn('[RevenueCat] Server subscription sync failed:', error);
    return false;
  }
};

const purchasesService = {
  async restorePurchases(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    const customerInfo = await Purchases.restorePurchases();
    await Purchases.invalidateCustomerInfoCache();
    return hasActiveEntitlement(customerInfo, PRO_ENTITLEMENT);
  },
};

export const usePaywall = () => {
  const { refreshCustomerInfo } = usePurchasesContext();
  const presentPaywall = useChampoPaywall();

  return useCallback(async () => {
    const upgraded = await presentPaywall();

    if (upgraded) {
      const [, synced] = await Promise.all([
        refreshCustomerInfo(),
        syncSubscriptionAfterChange(),
      ]);
      return synced;
    }

    const latestCustomerInfo = await refreshCustomerInfo();
    const hasProAccess = hasActiveEntitlement(latestCustomerInfo, PRO_ENTITLEMENT);

    // Sync existing Pro users too so RevenueCat and Supabase can recover from
    // a previously missed purchase callback.
    if (hasProAccess) {
      return syncSubscriptionAfterChange();
    }

    return false;
  }, [presentPaywall, refreshCustomerInfo]);
};

export const useRestorePurchases = () => {
  const { refreshCustomerInfo } = usePurchasesContext();

  return useCallback(async () => {
    if (Platform.OS === 'web') {
      return false;
    }

    const restored = await purchasesService.restorePurchases();

    if (!restored) {
      await refreshCustomerInfo();
      return false;
    }

    const [, synced] = await Promise.all([
      refreshCustomerInfo(),
      syncSubscriptionAfterChange(),
    ]);
    return synced;
  }, [refreshCustomerInfo]);
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

export { hasActiveEntitlement, PRO_ENTITLEMENT };
