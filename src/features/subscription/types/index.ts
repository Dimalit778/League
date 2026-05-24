import { Database } from '@/types/database.types';

type SubscriptionType = Database['public']['Enums']['subscription_type'];

type SubscriptionDetails = {
  id: string;
  user_id: string;
  subscription_type: SubscriptionType;
  start_date: string;
  end_date: string;
  product_id?: string | null;
  transaction_id?: string | null;
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
