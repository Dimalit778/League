import { getMySubscriptionAccess } from '@/features/subscription/api/subscriptionApi';
import { DEFAULT_PRO_ACCESS, SUBSCRIPTIONS_ENABLED } from '@/features/subscription/subscriptionMode';
import { KEYS } from '@/lib/queryClient';
import { useAuthStore } from '@/store/AuthStore';
import { skipToken, useQuery } from '@tanstack/react-query';

const STALE_TIME = 1000 * 60 * 5;

export const useSubscriptionAccess = (enabled = true) => {
  const userId = useAuthStore((state) => state.user?.id);
  const useDefaultProAccess = !SUBSCRIPTIONS_ENABLED;
  const canLoad = enabled && !useDefaultProAccess && !!userId;

  return useQuery({
    queryKey: canLoad
      ? KEYS.subscription.access(userId)
      : KEYS.subscription.access(useDefaultProAccess ? 'default-pro' : 'disabled'),
    queryFn: canLoad ? getMySubscriptionAccess : skipToken,
    initialData: useDefaultProAccess ? DEFAULT_PRO_ACCESS : undefined,
    staleTime: STALE_TIME,
  });
};
