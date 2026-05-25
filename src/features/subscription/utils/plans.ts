import { SubscriptionType } from '../types';

export const plans = [
  {
    type: 'FREE' as SubscriptionType,
    price: 'Free',
    features: [
      'Create 1 custom league',
      'Up to 6 members per league',
      'Access 2 featured competitions',
      'Basic leaderboard',
    ],
  },
  {
    type: 'PRO' as SubscriptionType,
    price: '$3.99',
    features: [
      'Create up to 3 custom leagues',
      'Choose 6 or 12 members per league',
      'Access all competitions',
      'Advanced prediction stats',
      'League history and fixture archive',
    ],
  },
];

export default plans;
