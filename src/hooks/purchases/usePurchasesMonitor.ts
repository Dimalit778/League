import { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import Purchases from 'react-native-purchases';

import { useAuthStore } from '@/store/AuthStore';
import { verifySubscriptionStatus } from './usePurchasesInitialize';

const PURCHASES_CONFIG_CHECK_INTERVAL = 1000;

export function usePurchasesMonitor(): boolean {
  const setSubscriptionStatus = useAuthStore((s) => s.setIsSubscribed);

  // Tracks if Purchases SDK is configured
  const [arePurchasesConfigured, setArePurchasesConfigured] = useState(false);
  // Tracks if monitoring (listeners) is set up
  const [isPurchaseMonitorSetUp, setIsPurchaseMonitorSetUp] = useState(false);

  const refreshSubscriptionStatus = useCallback(async () => {
    if (!arePurchasesConfigured) return;

    try {
      const { hasActiveSubscription } = await verifySubscriptionStatus();
      setSubscriptionStatus(hasActiveSubscription);
    } catch (error) {
      console.error('[usePurchasesMonitor] Error refreshing subscription status:', error);
    }
  }, [arePurchasesConfigured, setSubscriptionStatus]);

  // Poll until Purchases SDK is configured
  useEffect(() => {
    const intervalId = setInterval(async () => {
      const configured = await Purchases.isConfigured();
      if (configured) {
        setArePurchasesConfigured(true);
        clearInterval(intervalId);
      }
    }, PURCHASES_CONFIG_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  // Listen for app foreground and RevenueCat updates
  useEffect(() => {
    if (!arePurchasesConfigured) {
      setIsPurchaseMonitorSetUp(false);
      return;
    }

    // Refresh on app foreground
    const appStateListener = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        refreshSubscriptionStatus();
      }
    });

    // Refresh on RevenueCat customer info updates
    Purchases.addCustomerInfoUpdateListener(refreshSubscriptionStatus);

    setIsPurchaseMonitorSetUp(true);

    return () => {
      appStateListener.remove();
      setIsPurchaseMonitorSetUp(false);
    };
  }, [refreshSubscriptionStatus, arePurchasesConfigured]);

  return isPurchaseMonitorSetUp;
}
