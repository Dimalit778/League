import { QUERY_KEYS } from '@/lib/tanstack/keys';
import {
  subscriptionService,
  SubscriptionType,
} from '@/services/subscriptionService';
import { useMemberStore } from '@/store/MemberStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useSubscription = () => {
  const { member } = useMemberStore();
  const userId = member?.user_id;

  return useQuery({
    queryKey: userId
      ? QUERY_KEYS.subscriptions.byUser(userId)
      : ['subscriptions', 'unknown'] as const,
    queryFn: () => {
      if (!userId) {
        throw new Error('User id is required to load subscription');
      }
      return subscriptionService.getCurrentSubscription(userId);
    },
    enabled: !!userId,
    staleTime: 60 * 1000 * 5, // 5 minutes
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  const { member } = useMemberStore();
  const userId = member?.user_id;

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
      return subscriptionService.createSubscription(
        userId,
        subscriptionType,
        startDate,
        endDate
      );
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
  const { member } = useMemberStore();
  const userId = member?.user_id;

  return useMutation({
    mutationFn: (subscriptionId: string) => {
      return subscriptionService.cancelSubscription(subscriptionId);
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
  const { member } = useMemberStore();
  const userId = member?.user_id;

  return useQuery({
    queryKey: userId
      ? QUERY_KEYS.subscriptions.canCreateLeague(userId)
      : ['subscriptions', 'unknown', 'canCreateLeague'] as const,
    queryFn: () => {
      if (!userId) {
        throw new Error('User id is required to check league creation capability');
      }
      return subscriptionService.canCreateLeague(userId);
    },
    enabled: !!userId,
    staleTime: 60 * 1000 * 5, // 5 minutes
  });
};
