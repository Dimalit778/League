import { hasActiveEntitlement, PRO_ENTITLEMENT } from '@/lib/revenuecat/customerInfoSummary';
import { router } from 'expo-router';
import { createContext, use, useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform } from 'react-native';

import { usePurchasesContext } from './PurchasesProvider';

type PaywallContextValue = {
  presentPaywall: () => Promise<boolean>;
  finishPaywall: (purchased: boolean) => void;
  abandonPaywall: () => void;
};

const PaywallContext = createContext<PaywallContextValue | null>(null);

export function PaywallProvider({ children }: { children: React.ReactNode }) {
  const { customerInfo } = usePurchasesContext();
  const resolverRef = useRef<((purchased: boolean) => void) | null>(null);
  const promiseRef = useRef<Promise<boolean> | null>(null);

  const resolvePaywall = useCallback((purchased: boolean) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    promiseRef.current = null;
    resolve?.(purchased);
  }, []);

  const finishPaywall = useCallback(
    (purchased: boolean) => {
      resolvePaywall(purchased);
      if (router.canGoBack()) router.back();
    },
    [resolvePaywall],
  );

  const abandonPaywall = useCallback(() => {
    resolvePaywall(false);
  }, [resolvePaywall]);

  useEffect(
    () => () => {
      resolverRef.current?.(false);
      resolverRef.current = null;
      promiseRef.current = null;
    },
    [],
  );

  const presentPaywall = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;
    if (hasActiveEntitlement(customerInfo, PRO_ENTITLEMENT)) return true;

    // Reuse the current route result if two upgrade guards fire at the same time.
    if (promiseRef.current) return promiseRef.current;

    const result = new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
    promiseRef.current = result;
    router.push('/(app)/(paywall)');

    return result;
  }, [customerInfo]);

  const value = useMemo(
    () => ({ presentPaywall, finishPaywall, abandonPaywall }),
    [abandonPaywall, finishPaywall, presentPaywall],
  );

  return <PaywallContext.Provider value={value}>{children}</PaywallContext.Provider>;
}

export const useChampoPaywall = () => {
  const context = use(PaywallContext);

  if (!context) {
    throw new Error('useChampoPaywall must be used within PaywallProvider');
  }

  return context.presentPaywall;
};

export const usePaywallRouteControls = () => {
  const context = use(PaywallContext);

  if (!context) {
    throw new Error('usePaywallRouteControls must be used within PaywallProvider');
  }

  return {
    finishPaywall: context.finishPaywall,
    abandonPaywall: context.abandonPaywall,
  };
};
