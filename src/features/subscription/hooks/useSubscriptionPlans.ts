import { getSubscriptionPlans } from '@/features/subscription/api/subscriptionApi';
import { KEYS } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

const STALE_TIME = 1000 * 60 * 60 * 24;

export const useSubscriptionPlans = () =>
  useQuery({
    queryKey: KEYS.subscription.plans,
    queryFn: getSubscriptionPlans,
    staleTime: STALE_TIME,
  });
