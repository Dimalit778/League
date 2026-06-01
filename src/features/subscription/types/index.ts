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
  limit: number;
  leaguesCount: number;
  reachedLimit: boolean;
  usagePercent: number;
};

type CurrentSubscription = {
  type: SubscriptionPlan;
  start_date: string | null;
  end_date: string | null;
  product_id: string | null;
  transaction_id: string | null;
  limits: plansLimits;
};
type plansLimits = {
  maxLeagues: number;
  maxMembersPerLeague: readonly number[];
  competitions: readonly string[];
  weeklyAiTips: number | null;
};
export type { CurrentSubscription, plansLimits, SubscriptionDetails, SubscriptionLimits, SubscriptionType };
