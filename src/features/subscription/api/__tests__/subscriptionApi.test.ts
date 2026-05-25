import { subscriptionApi } from '../subscriptionApi';

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

    it('returns PRO limits for PRO type', () => {
      const limits = subscriptionApi.getSubscriptionLimits('PRO' as any);
      expect(limits).toEqual({
        ownedLeagues: 3,
        maxMembersPerLeague: 12,
        allowedLeagueSizes: [6, 12],
        aiTipsPerWeek: Infinity,
      });
    });

    it('keeps PREMIUM users on Pro limits', () => {
      const limits = subscriptionApi.getSubscriptionLimits('PREMIUM' as any);
      expect(limits).toEqual({
        ownedLeagues: 3,
        maxMembersPerLeague: 12,
        allowedLeagueSizes: [6, 12],
        aiTipsPerWeek: Infinity,
      });
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
