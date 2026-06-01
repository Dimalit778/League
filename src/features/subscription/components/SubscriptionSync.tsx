import { useSyncSubscriptionFromRevenueCat } from '@/features/subscription/hooks/useSubscription';

/** Runs RevenueCat → Supabase reconciliation for the logged-in user. */
export const SubscriptionSync = () => {
  useSyncSubscriptionFromRevenueCat();
  return null;
};
