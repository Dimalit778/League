import { router } from 'expo-router';
import { createContext, use, useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform } from 'react-native';

export type PaywallResult = 'purchased' | 'restored' | false;

type PaywallContextValue = {
  presentPaywall: () => Promise<PaywallResult>;
  finishPaywall: (result: PaywallResult) => void;
  abandonPaywall: () => void;
};

const PaywallContext = createContext<PaywallContextValue | null>(null);

export function PaywallProvider({ children }: { children: React.ReactNode }) {
  const resolverRef = useRef<((result: PaywallResult) => void) | null>(null);
  const promiseRef = useRef<Promise<PaywallResult> | null>(null);

  const resolvePaywall = useCallback((result: PaywallResult) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    promiseRef.current = null;
    resolve?.(result);
  }, []);

  const finishPaywall = useCallback(
    (result: PaywallResult) => {
      resolvePaywall(result);
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

  const presentPaywall = useCallback(async (): Promise<PaywallResult> => {
    if (Platform.OS === 'web') return false;

    // Reuse the current route result if two upgrade guards fire at the same time.
    if (promiseRef.current) return promiseRef.current;

    const result = new Promise<PaywallResult>((resolve) => {
      resolverRef.current = resolve;
    });
    promiseRef.current = result;
    router.push('/(app)/(paywall)');

    return result;
  }, []);

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
