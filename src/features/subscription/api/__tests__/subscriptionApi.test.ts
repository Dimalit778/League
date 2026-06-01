import { subscriptionApi } from '../subscriptionApi';

describe('subscriptionApi', () => {
  describe('getSubscriptionLimits', () => {
    it('returns FREE limits by default', () => {
      const limits = subscriptionApi.getSubscriptionLimits(null);
      expect(limits).toEqual({
        maxLeagues: 1,
        maxMembersPerLeague: [6],
        weeklyAiTips: 3,
        advancedStats: false,
      });
    });

    it('returns FREE limits for FREE type', () => {
      const limits = subscriptionApi.getSubscriptionLimits('FREE' as any);
      expect(limits).toEqual({
        maxLeagues: 1,
        maxMembersPerLeague: [6],
        weeklyAiTips: 3,
        advancedStats: false,
      });
    });

    it('returns BASIC limits for BASIC type', () => {
      const limits = subscriptionApi.getSubscriptionLimits('BASIC' as any);
      expect(limits).toEqual({
        maxLeagues: 3,
        maxMembersPerLeague: [6, 10],
        weeklyAiTips: 6,
        advancedStats: true,
      });
    });

    it('returns PREMIUM limits for PREMIUM type', () => {
      const limits = subscriptionApi.getSubscriptionLimits('PREMIUM' as any);
      expect(limits).toEqual({
        maxLeagues: 5,
        maxMembersPerLeague: [6, 10, 20],
        weeklyAiTips: null,
        advancedStats: true,
      });
    });

    it('normalizes legacy PRO type to BASIC limits', () => {
      const limits = subscriptionApi.getSubscriptionLimits('PRO' as any);
      expect(limits.maxLeagues).toBe(3);
      expect(limits.maxMembersPerLeague).toEqual([6, 10]);
    });
  });
});
