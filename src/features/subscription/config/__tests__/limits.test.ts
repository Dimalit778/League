import { FREE_LIMITS, PRO_LIMITS } from '../limits';

describe('FREE_LIMITS', () => {
  it('allows 1 owned league', () => expect(FREE_LIMITS.ownedLeagues).toBe(1));
  it('allows max 6 members', () => expect(FREE_LIMITS.maxMembersPerLeague).toBe(6));
  it('only allows size 6', () => expect(FREE_LIMITS.allowedLeagueSizes).toEqual([6]));
  it('allows 3 ai tips/week', () => expect(FREE_LIMITS.aiTipsPerWeek).toBe(3));
});

describe('PRO_LIMITS', () => {
  it('allows 3 owned leagues', () => expect(PRO_LIMITS.ownedLeagues).toBe(3));
  it('allows max 12 members', () => expect(PRO_LIMITS.maxMembersPerLeague).toBe(12));
  it('allows sizes 6 and 12', () => expect(PRO_LIMITS.allowedLeagueSizes).toEqual([6, 12]));
  it('allows unlimited ai tips', () => expect(PRO_LIMITS.aiTipsPerWeek).toBe(Infinity));
});
