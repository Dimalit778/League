import { usePaywall } from '@/lib/revenuecat/purchases';
import { SUBSCRIPTIONS_ENABLED } from '../subscriptionMode';
import { useSubscriptionAccess } from './useSubscriptionAccess';

export const useEnsureProAccess = () => {
  const openPaywall = usePaywall();
  const { data: access } = useSubscriptionAccess();
  const isPro = !SUBSCRIPTIONS_ENABLED || access?.planCode === 'pro';

  const ensureProAccess = async (): Promise<boolean> => {
    if (!SUBSCRIPTIONS_ENABLED || isPro) return true;
    return openPaywall();
  };

  return { isPro, openPaywall, ensureProAccess };
};
