import { FREE_LIMITS, PAID_LIMITS } from '../limits';

describe('FREE_LIMITS', () => {
  it('allows 1 owned league', () => expect(FREE_LIMITS.ownedLeagues).toBe(1));
  it('allows max 6 members', () => expect(FREE_LIMITS.maxMembersPerLeague).toBe(6));
  it('only allows size 6', () => expect(FREE_LIMITS.allowedLeagueSizes).toEqual([6]));
  it('allows 3 ai tips/week', () => expect(FREE_LIMITS.aiTipsPerWeek).toBe(3));
});

describe('PAID_LIMITS', () => {
  it('allows 3 owned leagues', () => expect(PAID_LIMITS.ownedLeagues).toBe(3));
  it('allows max 20 members', () => expect(PAID_LIMITS.maxMembersPerLeague).toBe(20));
  it('allows sizes 6, 10 and 20', () => expect(PAID_LIMITS.allowedLeagueSizes).toEqual([6, 10, 20]));
  it('allows unlimited ai tips', () => expect(PAID_LIMITS.aiTipsPerWeek).toBe(Infinity));
});
