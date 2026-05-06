import { plans } from '../plans';

describe('subscription plans', () => {
  it('has exactly 2 visible plans', () => {
    expect(plans).toHaveLength(2);
  });

  it('has FREE and BASIC Pro types', () => {
    const types = plans.map((p) => p.type);
    expect(types).toEqual(['FREE', 'BASIC']);
  });

  it('FREE plan has correct price', () => {
    const free = plans.find((p) => p.type === 'FREE');
    expect(free?.price).toBe('Free');
  });

  it('BASIC Pro plan has correct price', () => {
    const basic = plans.find((p) => p.type === 'BASIC');
    expect(basic?.price).toBe('$3.99');
  });

  it('each plan has features array', () => {
    plans.forEach((plan) => {
      expect(Array.isArray(plan.features)).toBe(true);
      expect(plan.features.length).toBeGreaterThan(0);
    });
  });

  it('BASIC Pro has more features than FREE', () => {
    const free = plans.find((p) => p.type === 'FREE')!;
    const basic = plans.find((p) => p.type === 'BASIC')!;
    expect(basic.features.length).toBeGreaterThan(free.features.length);
  });
});
