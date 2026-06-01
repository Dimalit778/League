import { subscriptionApi } from '../subscriptionApi';

describe('subscriptionApi', () => {
  describe('getSubscriptionLimits', () => {
    it('returns FREE limits by default', () => {
      const limits = subscriptionApi.getSubscriptionLimits(null);
      expect(limits).toEqual({
        maxLeagues: 2,
        maxMembersPerLeague: [6],
        competitions: ['ENGLISH', 'ITALIAN'],
        weeklyAiTips: 3,
      });
    });

    it('returns FREE limits for FREE type', () => {
      const limits = subscriptionApi.getSubscriptionLimits('FREE');
      expect(limits).toEqual({
        maxLeagues: 2,
        maxMembersPerLeague: [6],
        competitions: ['ENGLISH', 'ITALIAN'],
        weeklyAiTips: 3,
      });
    });

    it('returns PRO limits for PRO type', () => {
      const limits = subscriptionApi.getSubscriptionLimits('PRO');
      expect(limits).toEqual({
        maxLeagues: 5,
        maxMembersPerLeague: [6, 12],
        competitions: ['ENGLISH', 'ITALIAN', 'GERMAN', 'FRENCH', 'SPANISH'],
        weeklyAiTips: null,
      });
    });

    it('normalizes legacy BASIC type to PRO limits', () => {
      const limits = subscriptionApi.getSubscriptionLimits('BASIC');
      expect(limits.maxLeagues).toBe(5);
      expect(limits.maxMembersPerLeague).toEqual([6, 12]);
    });
  });
});
