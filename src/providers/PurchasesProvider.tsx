import { KEYS } from '@/lib/queryClient';
import { configureRevenueCatLogging } from '@/lib/revenuecat/revenueCatLogging';
import { isRevenueCatNetworkError } from '@/lib/revenuecat/revenueCatNetworkError';
import { useAuthStore } from '@/store/AuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, use, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
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
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? process.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY ?? null;
  }

  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? process.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY ?? null;
  }

  return null;
};

const isAnonymousRevenueCatUser = (customerInfo: CustomerInfo | null): boolean =>
  customerInfo?.originalAppUserId?.startsWith('$RCAnonymousID:') ?? true;

type PurchasesState = {
  isReady: boolean;
  isUserSynced: boolean;
  isOffline: boolean;
  customerInfo: CustomerInfo | null;
  error: Error | null;
};

type PurchasesAction =
  | { type: 'setReady'; value: boolean }
  | { type: 'setUserSynced'; value: boolean }
  | { type: 'setOffline'; value: boolean }
  | { type: 'setCustomerInfo'; value: CustomerInfo | null }
  | { type: 'setError'; value: Error | null };

function purchasesReducer(state: PurchasesState, action: PurchasesAction): PurchasesState {
  switch (action.type) {
    case 'setReady':
      return { ...state, isReady: action.value };
    case 'setUserSynced':
      return { ...state, isUserSynced: action.value };
    case 'setOffline':
      return { ...state, isOffline: action.value };
    case 'setCustomerInfo':
      return { ...state, customerInfo: action.value };
    case 'setError':
      return { ...state, error: action.value };
  }
}

export const PurchasesProvider = ({ children }: { children: React.ReactNode }) => {
  const userId = useAuthStore((s) => s.user?.id ?? null);

  const queryClient = useQueryClient();
  const isConfiguredRef = useRef(false);
  const customerInfoRef = useRef<CustomerInfo | null>(null);
  const isUserSyncedRef = useRef(false);

  const [{ isReady, isUserSynced, isOffline, customerInfo, error }, dispatch] = useReducer(purchasesReducer, {
    isReady: false,
    isUserSynced: Platform.OS === 'web',
    isOffline: false,
    customerInfo: null,
    error: null,
  });

  const applyCustomerInfo = useCallback(
    (nextCustomerInfo: CustomerInfo | null) => {
      customerInfoRef.current = nextCustomerInfo;
      dispatch({ type: 'setCustomerInfo', value: nextCustomerInfo });

      const trusted = isUserSyncedRef.current;

      if (!userId || !trusted) return;

      queryClient.invalidateQueries({ queryKey: KEYS.users.leagues(userId) });
    },
    [queryClient, userId],
  );

  const markUserSynced = useCallback((synced: boolean) => {
    isUserSyncedRef.current = synced;
    dispatch({ type: 'setUserSynced', value: synced });
  }, []);

  const handleNetworkFailure = useCallback(() => {
    dispatch({ type: 'setOffline', value: true });
    dispatch({ type: 'setError', value: null });
    dispatch({ type: 'setReady', value: true });
    markUserSynced(true);
  }, [markUserSynced]);

  const refreshCustomerInfo = useCallback(async (): Promise<CustomerInfo | null> => {
    if (!isConfiguredRef.current || Platform.OS === 'web') {
      return null;
    }

    try {
      const nextCustomerInfo = await Purchases.getCustomerInfo();
      dispatch({ type: 'setOffline', value: false });
      applyCustomerInfo(nextCustomerInfo);
      dispatch({ type: 'setError', value: null });
      return nextCustomerInfo;
    } catch (refreshError) {
      if (isRevenueCatNetworkError(refreshError)) {
        handleNetworkFailure();
        return customerInfoRef.current;
      }

      const nextError = refreshError instanceof Error ? refreshError : new Error(String(refreshError));
      dispatch({ type: 'setError', value: nextError });
      return null;
    }
  }, [applyCustomerInfo, handleNetworkFailure]);

  useEffect(() => {
    let cancelled = false;

    const configurePurchases = async () => {
      if (Platform.OS === 'web') {
        markUserSynced(true);
        dispatch({ type: 'setReady', value: true });
        return;
      }

      const apiKey = getRevenueCatApiKey();
      if (!apiKey) {
        dispatch({ type: 'setError', value: new Error('RevenueCat API key is not configured for this platform') });
        dispatch({ type: 'setReady', value: false });
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
            dispatch({ type: 'setOffline', value: false });
            applyCustomerInfo(initialCustomerInfo);
            markUserSynced(true);
            dispatch({ type: 'setError', value: null });
            dispatch({ type: 'setReady', value: true });
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
          dispatch({ type: 'setError', value: nextError });
          dispatch({ type: 'setReady', value: false });
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

            // New login — restore purchases so previous subscriptions are recovered
            if (logInResult.created) {
              try {
                nextCustomerInfo = await Purchases.restorePurchases();
              } catch {
                // restorePurchases is best-effort; keep the customerInfo from logIn
              }
            }
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
          dispatch({ type: 'setOffline', value: false });
          markUserSynced(true);
          applyCustomerInfo(nextCustomerInfo);
          dispatch({ type: 'setError', value: null });

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

          markUserSynced(true);
          const nextError = syncError instanceof Error ? syncError : new Error(String(syncError));
          dispatch({ type: 'setError', value: nextError });
        }
      }
    };

    syncRevenueCatUser();

    return () => {
      cancelled = true;
    };
  }, [applyCustomerInfo, handleNetworkFailure, isReady, markUserSynced, queryClient, userId]);

  const refreshCustomerInfoRef = useRef(refreshCustomerInfo);
  refreshCustomerInfoRef.current = refreshCustomerInfo;

  useEffect(() => {
    if (!isReady || !isConfiguredRef.current || Platform.OS === 'web') return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        refreshCustomerInfoRef.current();
      }
    };

    const appStateListener = AppState.addEventListener('change', handleAppStateChange);
    Purchases.addCustomerInfoUpdateListener(applyCustomerInfo);

    return () => {
      appStateListener.remove();
      Purchases.removeCustomerInfoUpdateListener(applyCustomerInfo);
    };
  }, [applyCustomerInfo, isReady]);

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
  const context = use(PurchasesContext);

  if (!context) {
    throw new Error('usePurchasesContext must be used within PurchasesProvider');
  }

  return context;
};
