import { subscriptionApi } from '../subscriptionApi';

const PAID_LIMITS_EXPECTED = {
  ownedLeagues: 3,
  maxMembersPerLeague: 20,
  allowedLeagueSizes: [6, 10, 20],
  aiTipsPerWeek: Infinity,
};

describe('subscriptionApi', () => {
  describe('getSubscriptionLimits', () => {
    it('returns FREE limits by default', () => {
      const limits = subscriptionApi.getSubscriptionLimits(null);
      expect(limits).toEqual({
        ownedLeagues: 1,
        maxMembersPerLeague: 6,
        allowedLeagueSizes: [6],
        aiTipsPerWeek: 3,
      });
    });

    it('returns FREE limits for FREE type', () => {
      const limits = subscriptionApi.getSubscriptionLimits('FREE' as any);
      expect(limits).toEqual({
        ownedLeagues: 1,
        maxMembersPerLeague: 6,
        allowedLeagueSizes: [6],
        aiTipsPerWeek: 3,
      });
    });

    it('returns PAID limits for BASIC type', () => {
      const limits = subscriptionApi.getSubscriptionLimits('BASIC' as any);
      expect(limits).toEqual(PAID_LIMITS_EXPECTED);
    });

    it('returns PAID limits for PREMIUM type', () => {
      const limits = subscriptionApi.getSubscriptionLimits('PREMIUM' as any);
      expect(limits).toEqual(PAID_LIMITS_EXPECTED);
    });

    it('returns PAID limits for legacy PRO type', () => {
      const limits = subscriptionApi.getSubscriptionLimits('PRO' as any);
      expect(limits).toEqual(PAID_LIMITS_EXPECTED);
    });
  });

  describe('getDefaultFreeSubscription', () => {
    it('returns a free subscription for the given user', () => {
      const sub = subscriptionApi.getDefaultFreeSubscription('user-123');
      expect(sub.user_id).toBe('user-123');
      expect(sub.subscription_type).toBe('FREE');
      expect(sub.id).toBe('free-user-123');
      expect(sub.product_id).toBeNull();
      expect(sub.transaction_id).toBeNull();
    });

    it('sets a far future end date', () => {
      const sub = subscriptionApi.getDefaultFreeSubscription('user-123');
      const endDate = new Date(sub.end_date);
      expect(endDate.getFullYear()).toBeGreaterThanOrEqual(2099);
    });
  });
});
