export const FREE_LIMITS = {
  ownedLeagues: 1,
  maxMembersPerLeague: 6,
  allowedLeagueSizes: [6] as const,
  aiTipsPerWeek: 3,
} as const;

export const PAID_LIMITS = {
  ownedLeagues: 3,
  maxMembersPerLeague: 20,
  allowedLeagueSizes: [6, 10, 20] as const,
  aiTipsPerWeek: Infinity,
} as const;

export type PlanLimits = typeof FREE_LIMITS | typeof PAID_LIMITS;
