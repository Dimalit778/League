import { PLAN_LIMITS } from '../plans';

describe('PLAN_LIMITS.FREE', () => {
  it('allows 2 leagues', () => expect(PLAN_LIMITS.FREE.maxLeagues).toBe(2));
  it('only allows size 6', () =>
    expect(PLAN_LIMITS.FREE.maxMembersPerLeague).toEqual([6]));
  it('allows 3 ai tips/week', () =>
    expect(PLAN_LIMITS.FREE.weeklyAiTips).toBe(3));
});

describe('PLAN_LIMITS.PRO', () => {
  it('allows 5 leagues', () => expect(PLAN_LIMITS.PRO.maxLeagues).toBe(5));
  it('allows sizes 6 and 12', () =>
    expect(PLAN_LIMITS.PRO.maxMembersPerLeague).toEqual([6, 12]));
  it('allows unlimited ai tips', () =>
    expect(PLAN_LIMITS.PRO.weeklyAiTips).toBeNull());
});
