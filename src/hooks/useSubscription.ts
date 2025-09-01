import { QUERY_KEYS } from '@/lib/queryKeys';
import { subscriptionService, SubscriptionType } from '@/services/subscriptionService';
import { useMemberStore } from '@/store/MemberStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useSubscription = () => {
  const { member } = useMemberStore();
  const userId = member?.user_id;

  return useQuery({
    queryKey: QUERY_KEYS.subscription(userId as string),
    queryFn: () => subscriptionService.getCurrentSubscription(userId as string),
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
      endDate 
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscription(userId as string) });
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscription(userId as string) });
    },
  });
};

export const useCanCreateLeague = () => {
  const { member } = useMemberStore();
  const userId = member?.user_id;

  return useQuery({
    queryKey: QUERY_KEYS.canCreateLeague(userId as string),
    queryFn: () => subscriptionService.canCreateLeague(userId as string),
    enabled: !!userId,
    staleTime: 60 * 1000 * 5, // 5 minutes
  });
};
