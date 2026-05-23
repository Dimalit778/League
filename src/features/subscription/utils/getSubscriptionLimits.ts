import { SubscriptionDetails, SubscriptionLimits, SubscriptionType } from '../types';

export const getSubscriptionLimits = (subscriptionType: SubscriptionType | null): SubscriptionLimits => {
  switch (subscriptionType) {
    case 'PREMIUM':
    case 'BASIC':
      return {
        maxLeagues: 5,
        maxMembersPerLeague: 20,
        advancedStats: true,
        leagueHistory: true,
        customScoring: true,
      };
    case 'FREE':
    default:
      return {
        maxLeagues: 1,
        maxMembersPerLeague: 6,
        advancedStats: false,
        leagueHistory: false,
        customScoring: false,
      };
  }
};

export const getDefaultFreeSubscription = (userId: string): SubscriptionDetails => {
  // Create a virtual FREE subscription that isn't stored in the database
  return {
    id: 'free-' + userId,
    user_id: userId,
    subscription_type: 'FREE',
    start_date: new Date().toISOString(),
    end_date: new Date(2099, 11, 31).toISOString(), // Far future date
    access_advanced_stats: false,
    can_add_members: false,
  };
};
