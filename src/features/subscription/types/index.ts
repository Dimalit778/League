import { Database } from '@/types/database.types';

type SubscriptionType = Database['public']['Enums']['subscription_type'];

type SubscriptionDetails = {
  id: string;
  user_id: string;
  subscription_type: SubscriptionType;
  start_date: string;
  end_date: string;
  access_advanced_stats: boolean;
  can_add_members: boolean;
};

type SubscriptionLimits = {
  maxLeagues: number;
  maxMembersPerLeague: number;
  advancedStats: boolean;
  leagueHistory: boolean;
  customScoring: boolean;
};

type SubscriptionDetailsWithLimits = SubscriptionDetails & {
  limits: SubscriptionLimits;
};

export type { SubscriptionDetails, SubscriptionDetailsWithLimits, SubscriptionLimits, SubscriptionType };
