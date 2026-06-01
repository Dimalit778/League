import { plansLimits } from '../types';

export type SubscriptionPlan = 'FREE' | 'PRO';
export type SubscriptionPlanInput = SubscriptionPlan | 'BASIC' | 'PREMIUM' | null | undefined;

export const PLAN_LIMITS = {
  FREE: {
    maxLeagues: 2,
    maxMembersPerLeague: [6],
    competitions: ['ENGLISH', 'ITALIAN'],
    weeklyAiTips: 3,
  },
  PRO: {
    maxLeagues: 5,
    maxMembersPerLeague: [6, 12],
    competitions: ['ENGLISH', 'ITALIAN', 'GERMAN', 'FRENCH', 'SPANISH'],
    weeklyAiTips: null,
  },
} as const;

export const plans = [
  {
    type: 'FREE',
    price: 'Free',
    features: ['Join or create up to 2 leagues', 'League size up to 6 members', 'English & Italian leagues only'],
  },
  {
    type: 'PRO',
    price: '$30',
    features: ['Join or create up to 5 leagues', 'League size up to 12 members', 'All competitions'],
  },
] as const satisfies readonly {
  type: SubscriptionPlan;
  price: string;
  features: readonly string[];
}[];

export const normalizeSubscriptionPlan = (plan: SubscriptionPlanInput): SubscriptionPlan => {
  if (plan === 'PRO') return 'PRO';
  if (plan === 'BASIC' || plan === 'PREMIUM') return 'PRO';
  return 'FREE';
};

export const getSubscriptionLimits = (plan: SubscriptionPlanInput): plansLimits => {
  return PLAN_LIMITS[normalizeSubscriptionPlan(plan)];
};

export const isPaidPlan = (plan: SubscriptionPlanInput): boolean => {
  return normalizeSubscriptionPlan(plan) !== 'FREE';
};

export const getSubscriptionPlanFromProductId = (productId?: string | null): Exclude<SubscriptionPlan, 'FREE'> => {
  return 'PRO';
};

export default plans;
