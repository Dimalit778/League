import { useCallback, useEffect, useRef, useState } from 'react';
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
  isLoading: boolean;
  isProcessing: boolean;
  error: PurchasesHookError | null;
  purchasePackage: (pkg: PurchasesPackage) => Promise<CustomerInfo>;
  restorePurchases: () => Promise<CustomerInfo>;
  hasActiveEntitlement: (info: CustomerInfo, entitlementId?: string) => boolean;
}

export function usePurchases(): UsePurchasesResult {
  // List of available purchase packages (products)
  const [availablePackages, setAvailablePackages] = useState<readonly PurchasesPackage[]>([]);
  // RevenueCat customer info (entitlements, etc.)
  const [currentCustomerInfo, setCurrentCustomerInfo] = useState<CustomerInfo | null>(null);
  // Loading state for initial fetch
  const [isLoading, setIsLoading] = useState(true);
  // Processing state for purchase/restore actions
  const [isProcessing, setIsProcessing] = useState(false);
  // Structured error object for UI consumption
  const [error, setError] = useState<PurchasesHookError | null>(null);
  // Tracks if the component has mounted to prevent state updates on unmounted components during async operations
  const hasMounted = useRef(true);

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

    const fetchPurchasesData = async () => {
      setError(null);
      try {
        const isConfigured = await Purchases.isConfigured();
        if (!isConfigured) {
          setError({ message: 'Purchases SDK is not initialized.', code: 'NOT_INITIALIZED' });
          setIsLoading(false);
          return;
        }
        const [offerings, info] = await Promise.all([Purchases.getOfferings(), Purchases.getCustomerInfo()]);
        if (hasMounted.current) {
          setAvailablePackages(offerings.current?.availablePackages ?? []);
          setCurrentCustomerInfo(info);
        }
      } catch (error) {
        handlePurchasesError(error);
      } finally {
        if (hasMounted.current) setIsLoading(false);
      }
    };

    fetchPurchasesData();

    return () => {
      hasMounted.current = false;
    };
  }, [handlePurchasesError]);

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
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        setCurrentCustomerInfo(customerInfo);
        return customerInfo;
      } catch (error) {
        handlePurchasesError(error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [handlePurchasesError],
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
      const info = await Purchases.restorePurchases();
      setCurrentCustomerInfo(info);
      return info;
    } catch (error) {
      handlePurchasesError(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [handlePurchasesError]);

  const hasActiveEntitlement = useCallback((info: CustomerInfo, entitlementId?: string): boolean => {
    if (!info?.entitlements?.active) return false;
    const activeEntitlements = info.entitlements.active;
    if (!entitlementId) {
      return Object.keys(activeEntitlements).length > 0;
    }
    return activeEntitlements[entitlementId] !== undefined;
  }, []);

  return {
    availablePackages,
    customerInfo: currentCustomerInfo,
    isLoading,
    isProcessing,
    error,
    purchasePackage,
    restorePurchases,
    hasActiveEntitlement,
  };
}

export default usePurchases;
