import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { subscriptionService, SubscriptionType } from '@/services/subscriptionService';
import { useStoreData } from '@/store/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useSubscription = (userId?: string) => {
  // If userId is provided directly, use it; otherwise try to get it from member store
  let memberUserId: string | undefined;

  const finalUserId = userId || memberUserId;

  return useQuery({
    queryKey: finalUserId ? QUERY_KEYS.subscriptions.byUser(finalUserId) : (['subscriptions', 'unknown'] as const),
    queryFn: () => {
      if (!finalUserId) {
        throw new Error('User id is required to load subscription');
      }
      return subscriptionService.getCurrentSubscription(finalUserId);
    },
    enabled: !!finalUserId,
    staleTime: 60 * 1000 * 5, // 5 minutes
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  const { member } = useStoreData();
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
      return subscriptionService.createSubscription(userId, subscriptionType, startDate, endDate);
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
  const { member } = useStoreData();
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
  const { member } = useStoreData();
  const userId = member?.user_id;

  return useQuery({
    queryKey: userId
      ? QUERY_KEYS.subscriptions.canCreateLeague(userId)
      : (['subscriptions', 'unknown', 'canCreateLeague'] as const),
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
