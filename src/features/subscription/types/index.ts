import { Database } from '@/types/database.types';
import { SubscriptionPlan } from '../config/plans';

type DbSubscriptionType = Database['public']['Enums']['subscription_type'];
type SubscriptionType = SubscriptionPlan;

type SubscriptionDetails = {
  id: string;
  user_id: string;
  type: SubscriptionType | DbSubscriptionType;
  start_date: string;
  end_date: string;
  product_id?: string | null;
  transaction_id?: string | null;
};

type SubscriptionLimits = {
  maxLeagues: number;
  maxMembersPerLeague: readonly number[];
  weeklyAiTips: number | null;
  advancedStats: boolean;
};

type CurrentSubscription = {
  type: SubscriptionPlan;
  start_date: string | null;
  end_date: string | null;
  product_id: string | null;
  transaction_id: string | null;
  limits: {
    maxLeagues: number;
    maxMembersPerLeague: readonly number[];
    weeklyAiTips: number | null;
    advancedStats: boolean;
  };
};
export type {
  CurrentSubscription,
  SubscriptionDetails,
  SubscriptionLimits,
  SubscriptionType,
};
