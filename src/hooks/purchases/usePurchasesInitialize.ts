import { useAuthStore } from '@/store/AuthStore';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY,
});

export function usePurchasesInitialize(): boolean {
  const setIsSubscribed = useAuthStore((s) => s.setIsSubscribed);

  const [isInitialized, setIsInitialized] = useState(false);

  const initializePurchases = useCallback(async () => {
    if (!API_KEY) {
      console.error('[usePurchasesInitialize] Missing RevenueCat API key');
      setIsInitialized(false);
      return;
    }

    try {
      // Configure RevenueCat SDK
      Purchases.configure({ apiKey: API_KEY });

      // Verify subscription status
      const { hasActiveSubscription } = await verifySubscriptionStatus();

      // Update app state
      setIsSubscribed(hasActiveSubscription);
      setIsInitialized(true);
    } catch (error) {
      setIsInitialized(false);

      // Provide detailed error log
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[usePurchasesInitialize] Initialization failed: ${errorMessage}`);
    }
  }, [setIsSubscribed]);

  useEffect(() => {
    if (!isInitialized) {
      initializePurchases();
    }
  }, [initializePurchases, isInitialized]);

  return isInitialized;
}

interface SubscriptionStatusResult {
  hasActiveSubscription: boolean;
}

export async function verifySubscriptionStatus(retryAttempt = 0): Promise<SubscriptionStatusResult> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const activeSubscriptions = Object.values(customerInfo.entitlements.active);
    const hasActiveSubscription = activeSubscriptions.length > 0;

    return {
      hasActiveSubscription,
    };
  } catch (error) {
    if (retryAttempt < MAX_RETRIES) {
      const backoffDelay = RETRY_DELAY * Math.pow(1.5, retryAttempt);

      await new Promise((resolve) => setTimeout(resolve, backoffDelay));

      return verifySubscriptionStatus(retryAttempt + 1);
    }

    throw error;
  }
}
