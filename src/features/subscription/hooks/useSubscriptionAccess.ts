import { getMySubscriptionAccess } from '@/features/subscription/api/subscriptionApi';
import { KEYS } from '@/lib/queryClient';
import { useAuthStore } from '@/store/AuthStore';
import { skipToken, useQuery } from '@tanstack/react-query';

const STALE_TIME = 1000 * 60 * 5;

export const useSubscriptionAccess = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: userId ? KEYS.subscription.access(userId) : KEYS.subscription.access('disabled'),
    queryFn: userId ? getMySubscriptionAccess : skipToken,
    staleTime: STALE_TIME,
  });
};
