import {
  hasActiveEntitlement,
  PRO_ENTITLEMENT,
  usePaywall,
  useRevenueCatSubscription,
} from '@/lib/revenuecat/purchases';

/**
 * Pro-gate helper shared by flows that unlock paid features.
 * `ensureProAccess` re-checks the entitlement against RevenueCat before and
 * after showing the paywall, so a stale local subscription state can't
 * grant or deny access incorrectly.
 */
export const useEnsureProAccess = () => {
  const openPaywall = usePaywall();
  const { subscription, refreshCustomerInfo } = useRevenueCatSubscription();

  const isPro = !!subscription.isActive;

  const ensureProAccess = async (): Promise<boolean> => {
    if (hasActiveEntitlement(await refreshCustomerInfo(), PRO_ENTITLEMENT)) {
      return true;
    }

    const purchased = await openPaywall();
    if (!purchased) return false;

    return hasActiveEntitlement(await refreshCustomerInfo(), PRO_ENTITLEMENT);
  };

  return { isPro, openPaywall, ensureProAccess };
};
