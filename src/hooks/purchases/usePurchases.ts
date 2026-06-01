import {
  getSubscriptionSummary,
  hasActiveEntitlement as checkActiveEntitlement,
  type SubscriptionSummary,
} from '@/lib/revenuecat/customerInfoSummary';
import { usePurchasesContext } from '@/providers/PurchasesProvider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Purchases, {
  CustomerInfo,
  PURCHASES_ERROR_CODE,
  PurchasesError,
  PurchasesPackage,
} from 'react-native-purchases';

function isPurchasesError(error: unknown): error is PurchasesError {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export interface PurchasesHookError {
  message: string;
  code?: string;
}

export interface UsePurchasesResult {
  availablePackages: readonly PurchasesPackage[];
  customerInfo: CustomerInfo | null;
  subscription: SubscriptionSummary;
  isSubscribed: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  error: PurchasesHookError | null;
  purchasePackage: (pkg: PurchasesPackage) => Promise<CustomerInfo>;
  restorePurchases: () => Promise<CustomerInfo>;
  hasActiveEntitlement: (info: CustomerInfo | null, entitlementId?: string) => boolean;
}

export function usePurchases(): UsePurchasesResult {
  const { customerInfo, isReady, isUserSynced, refreshCustomerInfo } = usePurchasesContext();
  const [availablePackages, setAvailablePackages] = useState<readonly PurchasesPackage[]>([]);
  const [isOfferingsLoading, setIsOfferingsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<PurchasesHookError | null>(null);
  const hasMounted = useRef(true);

  const subscription = useMemo(() => getSubscriptionSummary(customerInfo), [customerInfo]);
  const isSubscribed = isUserSynced && subscription.isActive;

  const handlePurchasesError = useCallback((error: unknown) => {
    if (isPurchasesError(error) && error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return;
    }
    if (isPurchasesError(error)) {
      setError({ message: error.message, code: String(error.code) });
    } else if (error instanceof Error) {
      setError({ message: error.message });
    } else {
      setError({ message: String(error) });
    }
  }, []);

  useEffect(() => {
    hasMounted.current = true;

    const fetchOfferings = async () => {
      if (!isReady) return;

      setError(null);
      setIsOfferingsLoading(true);

      try {
        const isConfigured = await Purchases.isConfigured();
        if (!isConfigured) {
          setError({ message: 'Purchases SDK is not initialized.', code: 'NOT_INITIALIZED' });
          return;
        }

        const offerings = await Purchases.getOfferings();
        if (hasMounted.current) {
          setAvailablePackages(offerings.current?.availablePackages ?? []);
        }
      } catch (fetchError) {
        handlePurchasesError(fetchError);
      } finally {
        if (hasMounted.current) setIsOfferingsLoading(false);
      }
    };

    fetchOfferings();

    return () => {
      hasMounted.current = false;
    };
  }, [handlePurchasesError, isReady]);

  const purchasePackage = useCallback(
    async (pkg: PurchasesPackage) => {
      setIsProcessing(true);
      setError(null);
      try {
        const isConfigured = await Purchases.isConfigured();
        if (!isConfigured) {
          const notInitError = {
            message: 'Purchases SDK is not initialized.',
            code: 'NOT_INITIALIZED',
          };
          setError(notInitError);
          throw notInitError;
        }
        const { customerInfo: purchasedCustomerInfo } = await Purchases.purchasePackage(pkg);
        await refreshCustomerInfo();
        return purchasedCustomerInfo;
      } catch (purchaseError) {
        handlePurchasesError(purchaseError);
        throw purchaseError;
      } finally {
        setIsProcessing(false);
      }
    },
    [handlePurchasesError, refreshCustomerInfo],
  );

  const restorePurchases = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const isConfigured = await Purchases.isConfigured();
      if (!isConfigured) {
        const notInitError = {
          message: 'Purchases SDK is not initialized.',
          code: 'NOT_INITIALIZED',
        };
        setError(notInitError);
        throw notInitError;
      }
      const restoredCustomerInfo = await Purchases.restorePurchases();
      await refreshCustomerInfo();
      return restoredCustomerInfo;
    } catch (restoreError) {
      handlePurchasesError(restoreError);
      throw restoreError;
    } finally {
      setIsProcessing(false);
    }
  }, [handlePurchasesError, refreshCustomerInfo]);

  return {
    availablePackages,
    customerInfo,
    subscription,
    isSubscribed,
    isLoading: !isReady || !isUserSynced || isOfferingsLoading,
    isProcessing,
    error,
    purchasePackage,
    restorePurchases,
    hasActiveEntitlement: checkActiveEntitlement,
  };
}

export { getSubscriptionSummary, type SubscriptionSummary } from '@/lib/revenuecat/customerInfoSummary';

export default usePurchases;
