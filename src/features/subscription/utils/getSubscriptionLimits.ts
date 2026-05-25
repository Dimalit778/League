import { FREE_LIMITS, PRO_LIMITS } from '../config/limits';
import { SubscriptionDetails, SubscriptionLimits, SubscriptionType } from '../types';

export const getSubscriptionLimits = (subscriptionType: SubscriptionType | null): SubscriptionLimits => {
  switch (subscriptionType) {
    case 'PRO':
    case 'PREMIUM':
    case 'BASIC':
      return { ...PRO_LIMITS };
    case 'FREE':
    default:
      return { ...FREE_LIMITS };
  }
};

export const isProPlan = (subscriptionType: SubscriptionType | null): boolean =>
  subscriptionType === 'PRO' || subscriptionType === 'BASIC' || subscriptionType === 'PREMIUM';

export const getDefaultFreeSubscription = (userId: string): SubscriptionDetails => ({
  id: 'free-' + userId,
  user_id: userId,
  subscription_type: 'FREE',
  start_date: new Date().toISOString(),
  end_date: new Date(2099, 11, 31).toISOString(),
  product_id: null,
  transaction_id: null,
});
