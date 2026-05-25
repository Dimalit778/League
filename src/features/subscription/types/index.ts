import { Database } from '@/types/database.types';

type SubscriptionType = Database['public']['Enums']['subscription_type'];

// These will be generated from DB once migration is applied; defined manually for now
type LeagueStatus = 'ACTIVE' | 'LOCKED';
type LockedReason = 'SUBSCRIPTION_EXPIRED' | 'FREE_LIMIT_EXCEEDED' | 'PRO_REQUIRED';

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
  ownedLeagues: number;
  maxMembersPerLeague: number;
  allowedLeagueSizes: readonly number[];
  aiTipsPerWeek: number;
};

type SubscriptionDetailsWithLimits = SubscriptionDetails & {
  limits: SubscriptionLimits;
};

export type {
  SubscriptionDetails,
  SubscriptionDetailsWithLimits,
  SubscriptionLimits,
  SubscriptionType,
  LeagueStatus,
  LockedReason,
};
