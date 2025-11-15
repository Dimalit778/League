import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { useAuthStore } from '@/store/AuthStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '../api/subscriptionApi';
import { SubscriptionType } from '../types';

export const useSubscription = () => {
  const userId = useAuthStore((s) => s.userId);

  return useQuery({
    queryKey: userId ? QUERY_KEYS.subscriptions.byUser(userId) : (['subscriptions', 'unknown'] as const),
    queryFn: () => {
      if (!userId) {
        throw new Error('User id is required to load subscription');
      }
      return subscriptionApi.getCurrentSubscription(userId);
    },
    enabled: !!userId,
    staleTime: 60 * 1000 * 5, // 5 minutes
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);

  return useMutation({
    mutationFn: ({
      subscriptionType,
      startDate,
      endDate,
    }: {
      subscriptionType: SubscriptionType;
      startDate?: Date;
      endDate?: Date;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      return subscriptionApi.createSubscription(userId, subscriptionType, startDate, endDate);
    },
    onSuccess: () => {
      if (!userId) return;
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.subscriptions.byUser(userId),
      });
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);

  return useMutation({
    mutationFn: (subscriptionId: string) => {
      return subscriptionApi.cancelSubscription(subscriptionId);
    },
    onSuccess: () => {
      if (!userId) return;
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.subscriptions.byUser(userId),
      });
    },
  });
};

export const useCanCreateLeague = () => {
  const userId = useAuthStore((s) => s.userId);

  return useQuery({
    queryKey: userId
      ? QUERY_KEYS.subscriptions.canCreateLeague(userId)
      : (['subscriptions', 'unknown', 'canCreateLeague'] as const),
    queryFn: () => {
      if (!userId) {
        throw new Error('User id is required to check league creation capability');
      }
      return subscriptionApi.canCreateLeague(userId);
    },
    enabled: !!userId,
    staleTime: 60 * 1000 * 5, // 5 minutes
  });
};
