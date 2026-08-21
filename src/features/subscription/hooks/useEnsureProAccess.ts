import { syncSubscriptionToServerUntilPro } from '@/features/subscription/api/subscriptionApi';
import { usePaywall, useRevenueCatSubscription } from '@/lib/revenuecat/purchases';

/**
 * Pro-gate helper shared by flows that unlock paid features.
 *
 * Client entitlement alone is not enough: server RPCs (e.g. create_new_league)
 * gate on the `user_subscriptions` table, which can lag behind — or outlast —
 * RevenueCat. The season-bounded Pro window in particular means a stale local
 * RevenueCat entitlement (e.g. from a past season) must never grant access on
 * its own, so `ensureProAccess` treats the server as the source of truth.
 */
export const useEnsureProAccess = () => {
  const openPaywall = usePaywall();
  const { subscription } = useRevenueCatSubscription();

  const isPro = !!subscription.isActive;

  const ensureProAccess = async (): Promise<boolean> => {
    // Server is the source of truth for the season-bounded Pro window. A stale
    // RevenueCat entitlement (e.g. a past season) must not grant access.
    try {
      const serverResult = await syncSubscriptionToServerUntilPro();
      if (serverResult?.plan === 'pro') {
        return true;
      }
    } catch (error) {
      console.warn('[Subscription] Server pro check failed:', error);
    }

    // Server did not confirm Pro (free, expired season, or sync failure): let the
    // user (re)purchase. `openPaywall` resolves true only after the server confirms.
    return openPaywall();
  };

  return { isPro, openPaywall, ensureProAccess };
};
