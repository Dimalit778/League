import { SubscriptionType } from '../types';

export const plans = [
  {
    type: 'FREE' as SubscriptionType,
    price: 'Free',
    features: [
      'Create or join 1 league',
      'Up to 6 members per league',
      'Basic leaderboard',
      'Full member management',
    ],
  },
  {
    type: 'BASIC' as SubscriptionType,
    price: '$3.99',
    features: [
      'Create or join up to 5 leagues',
      'Up to 20 members per league',
      'Advanced prediction stats',
      'League history and fixture archive',
      'Custom scoring rules soon',
      'Share league table highlights soon',
    ],
  },
];

export default plans;
