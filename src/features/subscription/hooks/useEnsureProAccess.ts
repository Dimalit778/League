import { usePaywall } from '@/lib/revenuecat/purchases';
import { useSubscriptionAccess } from './useSubscriptionAccess';

/**
 * Pro-gate helper shared by flows that unlock paid features.
 *
 * Uses the cached, server-authoritative subscription access loaded by the app.
 * RevenueCat-to-Supabase synchronization belongs after purchase/restore, not
 * before opening the paywall for a known Free user.
 */
export const useEnsureProAccess = () => {
  const openPaywall = usePaywall();
  const { data: access } = useSubscriptionAccess();
  const isPro = access?.planCode === 'pro';

  const ensureProAccess = async (): Promise<boolean> => {
    if (isPro) return true;
    return openPaywall();
  };

  return { isPro, openPaywall, ensureProAccess };
};
