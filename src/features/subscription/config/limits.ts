export const FREE_LIMITS = {
  ownedLeagues: 1,
  maxMembersPerLeague: 6,
  allowedLeagueSizes: [6] as const,
  aiTipsPerWeek: 3,
} as const;

export const PRO_LIMITS = {
  ownedLeagues: 3,
  maxMembersPerLeague: 12,
  allowedLeagueSizes: [6, 12] as const,
  aiTipsPerWeek: Infinity,
} as const;

export type PlanLimits = typeof FREE_LIMITS | typeof PRO_LIMITS;
