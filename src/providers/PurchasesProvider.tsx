import { KEYS } from '@/lib/queryClient';
import { configureRevenueCatLogging } from '@/lib/revenuecat/revenueCatLogging';
import { isRevenueCatNetworkError } from '@/lib/revenuecat/revenueCatNetworkError';
import { useAuthStore } from '@/store/AuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import Purchases, { CustomerInfo } from 'react-native-purchases';

type PurchasesContextValue = {
  isReady: boolean;
  isUserSynced: boolean;
  isOffline: boolean;
  customerInfo: CustomerInfo | null;
  error: Error | null;
  refreshCustomerInfo: () => Promise<CustomerInfo | null>;
};

const PurchasesContext = createContext<PurchasesContextValue | null>(null);

const getRevenueCatApiKey = (): string | null => {
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY ?? null;
  }

  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY ?? null;
  }

  return null;
};

const hasActiveEntitlement = (customerInfo: CustomerInfo | null): boolean => {
  if (!customerInfo?.entitlements?.active) return false;
  return Object.keys(customerInfo.entitlements.active).length > 0;
};

const isAnonymousRevenueCatUser = (customerInfo: CustomerInfo | null): boolean =>
  customerInfo?.originalAppUserId?.startsWith('$RCAnonymousID:') ?? true;

export const PurchasesProvider = ({ children }: { children: React.ReactNode }) => {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const setIsSubscribed = useAuthStore((s) => s.setIsSubscribed);
  const queryClient = useQueryClient();
  const isConfiguredRef = useRef(false);
  const customerInfoRef = useRef<CustomerInfo | null>(null);
  const isUserSyncedRef = useRef(false);

  const [isReady, setIsReady] = useState(false);
  const [isUserSynced, setIsUserSynced] = useState(Platform.OS === 'web');
  const [isOffline, setIsOffline] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const applyCustomerInfo = useCallback(
    (nextCustomerInfo: CustomerInfo | null) => {
      customerInfoRef.current = nextCustomerInfo;
      setCustomerInfo(nextCustomerInfo);

      const trusted = isUserSyncedRef.current;
      setIsSubscribed(!!userId && trusted ? hasActiveEntitlement(nextCustomerInfo) : false);

      if (!userId || !trusted) return;

      queryClient.invalidateQueries({ queryKey: KEYS.users.leagues(userId) });
    },
    [queryClient, setIsSubscribed, userId],
  );

  const markUserSynced = useCallback(
    (synced: boolean) => {
      isUserSyncedRef.current = synced;
      setIsUserSynced(synced);

      if (synced && customerInfoRef.current) {
        setIsSubscribed(!!userId && hasActiveEntitlement(customerInfoRef.current));
      } else if (!synced) {
        setIsSubscribed(false);
      }
    },
    [setIsSubscribed, userId],
  );

  const handleNetworkFailure = useCallback(() => {
    setIsOffline(true);
    setError(null);
    setIsReady(true);
    markUserSynced(true);

    if (customerInfoRef.current) {
      setIsSubscribed(!!userId && hasActiveEntitlement(customerInfoRef.current));
    }
  }, [markUserSynced, setIsSubscribed, userId]);

  const refreshCustomerInfo = useCallback(async (): Promise<CustomerInfo | null> => {
    if (!isConfiguredRef.current || Platform.OS === 'web') {
      return null;
    }

    try {
      const nextCustomerInfo = await Purchases.getCustomerInfo();
      setIsOffline(false);
      applyCustomerInfo(nextCustomerInfo);
      setError(null);
      return nextCustomerInfo;
    } catch (refreshError) {
      if (isRevenueCatNetworkError(refreshError)) {
        handleNetworkFailure();
        return customerInfoRef.current;
      }

      const nextError = refreshError instanceof Error ? refreshError : new Error(String(refreshError));
      setError(nextError);
      return null;
    }
  }, [applyCustomerInfo, handleNetworkFailure]);

  useEffect(() => {
    let cancelled = false;

    const configurePurchases = async () => {
      if (Platform.OS === 'web') {
        markUserSynced(true);
        setIsReady(true);
        return;
      }

      const apiKey = getRevenueCatApiKey();
      if (!apiKey) {
        setError(new Error('RevenueCat API key is not configured for this platform'));
        setIsReady(false);
        return;
      }

      try {
        configureRevenueCatLogging();

        const isConfigured = await Purchases.isConfigured();
        if (!isConfigured) {
          Purchases.configure({ apiKey });
        }

        isConfiguredRef.current = true;

        try {
          const initialCustomerInfo = await Purchases.getCustomerInfo();

          if (!cancelled) {
            setIsOffline(false);
            applyCustomerInfo(initialCustomerInfo);
            markUserSynced(true);
            setError(null);
            setIsReady(true);
          }
        } catch (customerInfoError) {
          if (!cancelled && isRevenueCatNetworkError(customerInfoError)) {
            handleNetworkFailure();
            return;
          }

          throw customerInfoError;
        }
      } catch (configureError) {
        if (!cancelled) {
          if (isRevenueCatNetworkError(configureError) && isConfiguredRef.current) {
            handleNetworkFailure();
            return;
          }

          const nextError = configureError instanceof Error ? configureError : new Error(String(configureError));
          setError(nextError);
          setIsReady(false);
        }
      }
    };

    configurePurchases();

    return () => {
      cancelled = true;
    };
  }, [applyCustomerInfo, handleNetworkFailure, markUserSynced]);

  useEffect(() => {
    if (!isReady || !isConfiguredRef.current || Platform.OS === 'web') return;

    let cancelled = false;

    const syncRevenueCatUser = async () => {
      markUserSynced(false);

      try {
        let nextCustomerInfo: CustomerInfo | null = null;

        if (userId) {
          const currentAppUserId = await Purchases.getAppUserID();

          if (currentAppUserId === userId) {
            nextCustomerInfo = await Purchases.getCustomerInfo();
          } else {
            const logInResult = await Purchases.logIn(userId);
            nextCustomerInfo = logInResult.customerInfo;
          }
        } else {
          const currentCustomerInfo = customerInfoRef.current ?? (await Purchases.getCustomerInfo());
          if (isAnonymousRevenueCatUser(currentCustomerInfo)) {
            nextCustomerInfo = currentCustomerInfo;
          } else {
            try {
              nextCustomerInfo = await Purchases.logOut();
            } catch {
              nextCustomerInfo = null;
            }
          }
        }

        if (!cancelled) {
          setIsOffline(false);
          markUserSynced(true);
          applyCustomerInfo(nextCustomerInfo);
          setError(null);

          if (userId) {
            queryClient.invalidateQueries({ queryKey: KEYS.users.leagues(userId) });
          }
        }
      } catch (syncError) {
        if (!cancelled) {
          if (isRevenueCatNetworkError(syncError)) {
            handleNetworkFailure();
            return;
          }

          markUserSynced(false);
          const nextError = syncError instanceof Error ? syncError : new Error(String(syncError));
          setError(nextError);
        }
      }
    };

    syncRevenueCatUser();

    return () => {
      cancelled = true;
    };
  }, [applyCustomerInfo, handleNetworkFailure, isReady, markUserSynced, queryClient, userId]);

  useEffect(() => {
    if (!isReady || !isConfiguredRef.current || Platform.OS === 'web') return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        refreshCustomerInfo();
      }
    };

    const appStateListener = AppState.addEventListener('change', handleAppStateChange);
    Purchases.addCustomerInfoUpdateListener(applyCustomerInfo);

    return () => {
      appStateListener.remove();
      Purchases.removeCustomerInfoUpdateListener(applyCustomerInfo);
    };
  }, [applyCustomerInfo, isReady, refreshCustomerInfo]);

  const value = useMemo(
    () => ({
      isReady,
      isUserSynced,
      isOffline,
      customerInfo,
      error,
      refreshCustomerInfo,
    }),
    [customerInfo, error, isOffline, isReady, isUserSynced, refreshCustomerInfo],
  );

  return <PurchasesContext.Provider value={value}>{children}</PurchasesContext.Provider>;
};

export const usePurchasesContext = () => {
  const context = useContext(PurchasesContext);

  if (!context) {
    throw new Error('usePurchasesContext must be used within PurchasesProvider');
  }

  return context;
};
