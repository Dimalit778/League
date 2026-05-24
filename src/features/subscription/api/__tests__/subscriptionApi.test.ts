import { subscriptionApi } from '../subscriptionApi';

describe('subscriptionApi', () => {
  describe('getSubscriptionLimits', () => {
    it('returns FREE limits by default', () => {
      const limits = subscriptionApi.getSubscriptionLimits(null);
      expect(limits).toEqual({
        maxLeagues: 1,
        maxMembersPerLeague: 6,
        advancedStats: false,
        leagueHistory: false,
        customScoring: false,
      });
    });

    it('returns FREE limits for FREE type', () => {
      const limits = subscriptionApi.getSubscriptionLimits('FREE' as any);
      expect(limits).toEqual({
        maxLeagues: 1,
        maxMembersPerLeague: 6,
        advancedStats: false,
        leagueHistory: false,
        customScoring: false,
      });
    });

    it('returns BASIC Pro limits', () => {
      const limits = subscriptionApi.getSubscriptionLimits('BASIC' as any);
      expect(limits).toEqual({
        maxLeagues: 5,
        maxMembersPerLeague: 20,
        advancedStats: true,
        leagueHistory: true,
        customScoring: true,
      });
    });

    it('keeps PREMIUM users on Pro limits', () => {
      const limits = subscriptionApi.getSubscriptionLimits('PREMIUM' as any);
      expect(limits).toEqual({
        maxLeagues: 5,
        maxMembersPerLeague: 20,
        advancedStats: true,
        leagueHistory: true,
        customScoring: true,
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
