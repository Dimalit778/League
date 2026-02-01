import { plans } from '../plans';

describe('subscription plans', () => {
  it('has exactly 3 plans', () => {
    expect(plans).toHaveLength(3);
  });

  it('has FREE, BASIC, and PREMIUM types', () => {
    const types = plans.map((p) => p.type);
    expect(types).toEqual(['FREE', 'BASIC', 'PREMIUM']);
  });

  it('FREE plan has correct price', () => {
    const free = plans.find((p) => p.type === 'FREE');
    expect(free?.price).toBe('Free');
  });

  it('BASIC plan has correct price', () => {
    const basic = plans.find((p) => p.type === 'BASIC');
    expect(basic?.price).toBe('$4.99');
  });

  it('PREMIUM plan has correct price', () => {
    const premium = plans.find((p) => p.type === 'PREMIUM');
    expect(premium?.price).toBe('$9.99');
  });

  it('each plan has features array', () => {
    plans.forEach((plan) => {
      expect(Array.isArray(plan.features)).toBe(true);
      expect(plan.features.length).toBeGreaterThan(0);
    });
  });

  it('PREMIUM has more features than FREE', () => {
    const free = plans.find((p) => p.type === 'FREE')!;
    const premium = plans.find((p) => p.type === 'PREMIUM')!;
    expect(premium.features.length).toBeGreaterThan(free.features.length);
  });
});
