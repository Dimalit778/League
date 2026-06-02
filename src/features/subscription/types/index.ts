import type { SubscriptionPlan } from '../config/plans';

type SubscriptionLimits = {
  limit: number;
  leaguesCount: number;
  reachedLimit: boolean;
  usagePercent: number;
};

export type SubscriptionType = SubscriptionPlan;
export type { SubscriptionLimits };
