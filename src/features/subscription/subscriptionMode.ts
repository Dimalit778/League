import type { SubscriptionAccess } from './api/subscriptionApi';

/**
 * Billing kill switch for the mobile client.
 *
 * Subscriptions are disabled by default. Set the public environment variable
 * to `true` in a new build when the paid plans are ready to return. The
 * matching database switch is documented in docs/subscriptions.md.
 */
export const SUBSCRIPTIONS_ENABLED = process.env.EXPO_PUBLIC_SUBSCRIPTIONS_ENABLED === 'true';

/** Immediate client-side access while billing is disabled. */
export const DEFAULT_PRO_ACCESS: SubscriptionAccess = {
  planCode: 'pro',
  isDefault: false,
  status: 'free_access',
  expiresAt: null,
  limits: {
    maxActiveLeagues: 5,
    maxMembersPerLeague: 12,
    weeklyAiAnalyses: null,
  },
  capabilities: {
    premiumCompetitions: true,
    advancedStats: true,
  },
};
