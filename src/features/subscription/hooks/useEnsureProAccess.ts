import { syncSubscriptionToServerUntilPro } from '@/features/subscription/api/subscriptionApi';
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
 *
 * Client entitlement alone is not enough: server RPCs (e.g. create_new_league)
 * gate on the `user_subscriptions` table, which can lag behind RevenueCat.
 * Before granting access we therefore also confirm the server sees `pro`,
 * syncing with retries. This closes the desync where the client is pro but the
 * server still returns free and the action fails with a cryptic "Plan limit".
 */
export const useEnsureProAccess = () => {
  const openPaywall = usePaywall();
  const { subscription, refreshCustomerInfo } = useRevenueCatSubscription();

  const isPro = !!subscription.isActive;

  const ensureProAccess = async (): Promise<boolean> => {
    let hasClientPro = hasActiveEntitlement(await refreshCustomerInfo(), PRO_ENTITLEMENT);

    if (!hasClientPro) {
      const purchased = await openPaywall();
      if (!purchased) return false;
      hasClientPro = hasActiveEntitlement(await refreshCustomerInfo(), PRO_ENTITLEMENT);
    }

    if (!hasClientPro) return false;

    // Client is pro — make sure the server row agrees before proceeding.
    const serverResult = await syncSubscriptionToServerUntilPro();
    return serverResult?.plan === 'pro';
  };

  return { isPro, openPaywall, ensureProAccess };
};
