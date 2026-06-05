import { usePurchasesContext } from '@/providers/PurchasesProvider';
import { useCallback, useMemo } from 'react';
import Purchases from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { getSubscriptionSummary } from './customerInfoSummary';
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
