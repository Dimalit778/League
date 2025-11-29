import { KEYS } from '@/lib/queryClient';
import { useAuth } from '@/providers/AuthProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '../api/subscriptionApi';
import type { SubscriptionType } from '../types';

export const useSubscription = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: userId ? KEYS.subscriptions.byUser(userId) : (['subscriptions', 'unknown'] as const),
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
  const { user } = useAuth();
  const userId = user?.id ?? null;

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
        queryKey: KEYS.subscriptions.byUser(userId),
      });
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useMutation({
    mutationFn: (subscriptionId: string) => {
      return subscriptionApi.cancelSubscription(subscriptionId);
    },
    onSuccess: () => {
      if (!userId) return;
      queryClient.invalidateQueries({
        queryKey: KEYS.subscriptions.byUser(userId),
      });
    },
  });
};

export const useCanCreateLeague = () => {
  const { user } = useAuth();
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
    staleTime: 60 * 1000 * 5, // 5 minutes
  });
};
