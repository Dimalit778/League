import { KEYS } from '@/lib/queryClient';
import { useAuthStore } from '@/store/AuthStore';
import { useQuery } from '@tanstack/react-query';
import { subscriptionApi } from '../api/subscriptionApi';

export const useSubscription = () => {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: userId ? KEYS.subscriptions.detail(userId) : (['subscriptions', 'unknown'] as const),
    queryFn: () => subscriptionApi.getCurrentSubscription(userId as string),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCanCreateLeague = () => {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: userId
      ? KEYS.subscriptions.canCreateLeague(userId)
      : (['subscriptions', 'unknown', 'canCreateLeague'] as const),
    queryFn: () => {
      if (!userId) {
        throw new Error('User id is required to check league creation capability');
      }
      return subscriptionApi.canCreateLeague(userId);
    },
    enabled: !!userId,
    staleTime: 60 * 1000 * 5,
  });
};
