import { SubscriptionType } from '@/services/subscriptionService';

export const subscriptionPlans = [
  {
    type: 'FREE' as SubscriptionType,
    price: 'Free',
    features: [
      'Join up to 2 leagues',
      'Create leagues with up to 6 members',
      'Basic prediction stats',
    ],
  },
  {
    type: 'BASIC' as SubscriptionType,
    price: '$4.99/mo',
    features: [
      'Join up to 3 leagues',
      'Create leagues with up to 8 members',
      'Advanced prediction stats',
      'League history',
    ],
  },
  {
    type: 'PREMIUM' as SubscriptionType,
    price: '$9.99/mo',
    features: [
      'Join up to 5 leagues',
      'Create leagues with up to 10 members',
      'Advanced prediction stats',
      'League history',
      'Custom league settings',
      'Priority support',
    ],
  },
];
