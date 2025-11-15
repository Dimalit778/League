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
};

export type { SubscriptionDetails, SubscriptionLimits, SubscriptionType };
