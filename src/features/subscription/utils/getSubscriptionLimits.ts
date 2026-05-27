import { FREE_LIMITS, PAID_LIMITS } from '../config/limits';
import { SubscriptionDetails, SubscriptionLimits, SubscriptionType } from '../types';

export const getSubscriptionLimits = (subscriptionType: SubscriptionType | null): SubscriptionLimits => {
  switch (subscriptionType) {
    case 'BASIC':
    case 'PREMIUM':
    case 'PRO': // backwards compat for existing DB records
      return { ...PAID_LIMITS };
    case 'FREE':
    default:
      return { ...FREE_LIMITS };
  }
};

export const isPaidPlan = (subscriptionType: SubscriptionType | null): boolean =>
  subscriptionType === 'BASIC' || subscriptionType === 'PREMIUM' || subscriptionType === 'PRO';

export const getDefaultFreeSubscription = (userId: string): SubscriptionDetails => ({
  id: 'free-' + userId,
  user_id: userId,
  subscription_type: 'FREE',
  start_date: new Date().toISOString(),
  end_date: new Date(2099, 11, 31).toISOString(),
  product_id: null,
  transaction_id: null,
});
