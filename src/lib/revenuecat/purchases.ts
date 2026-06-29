import { usePurchasesContext } from '@/providers/PurchasesProvider';
import { useCallback, useMemo } from 'react';
import { Linking, Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { getSubscriptionSummary, hasActiveEntitlement } from './customerInfoSummary';
const PRO_ENTITLEMENT = 'pro';

 const purchasesService = {
  async openPaywall(): Promise<boolean> {
    const result = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: PRO_ENTITLEMENT,
    });

    const purchased =
      result === PAYWALL_RESULT.PURCHASED ||
      result === PAYWALL_RESULT.RESTORED;

    if (purchased) {
      await Purchases.invalidateCustomerInfoCache();
    }

    return purchased;
  },
  async restorePurchases(): Promise<boolean> {
    const customerInfo = await Purchases.restorePurchases();
    await Purchases.invalidateCustomerInfoCache();
    return hasActiveEntitlement(customerInfo, PRO_ENTITLEMENT);
  },
  async openSubscriptionManagement(): Promise<void> {
    if (Platform.OS === 'ios') {
      await Linking.openURL('https://apps.apple.com/account/subscriptions');
      return;
    }

    if (Platform.OS === 'android') {
      await Linking.openURL('https://play.google.com/store/account/subscriptions');
    }
  },
};
export const usePaywall = () => {
  const { refreshCustomerInfo } = usePurchasesContext();

  return useCallback(async () => {
    const upgraded = await purchasesService.openPaywall();

    if (upgraded) {
      await refreshCustomerInfo();
    }

    return upgraded;
  }, [refreshCustomerInfo]);
};

export const useRestorePurchases = () => {
  const { refreshCustomerInfo } = usePurchasesContext();

  return useCallback(async () => {
    if (Platform.OS === 'web') {
      return false;
    }

    const restored = await purchasesService.restorePurchases();
    await refreshCustomerInfo();
    return restored;
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

export const useManageSubscription = () => {
  const openPaywall = usePaywall();
  const { subscription } = useRevenueCatSubscription();

  return useCallback(async () => {
    if (subscription.isActive && Platform.OS !== 'web') {
      await purchasesService.openSubscriptionManagement();
      return;
    }

    await openPaywall();
  }, [openPaywall, subscription.isActive]);
};
