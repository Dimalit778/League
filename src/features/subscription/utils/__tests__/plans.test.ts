import { plans } from '../../config/plans';

describe('subscription plans', () => {
  it('has exactly 2 visible plans', () => {
    expect(plans).toHaveLength(2);
  });

  it('has FREE and PRO types', () => {
    const types = plans.map((p) => p.type);
    expect(types).toEqual(['FREE', 'PRO']);
  });

  it('FREE plan has correct price', () => {
    const free = plans.find((p) => p.type === 'FREE');
    expect(free?.price).toBe('Free');
  });

  it('PRO plan has correct price', () => {
    const pro = plans.find((p) => p.type === 'PRO');
    expect(pro?.price).toBe('$30');
  });

  it('each plan has features array', () => {
    plans.forEach((plan) => {
      expect(Array.isArray(plan.features)).toBe(true);
      expect(plan.features.length).toBeGreaterThan(0);
    });
  });

  it('PRO has at least as many features as FREE', () => {
    const free = plans.find((p) => p.type === 'FREE')!;
    const pro = plans.find((p) => p.type === 'PRO')!;
    expect(pro.features.length).toBeGreaterThanOrEqual(free.features.length);
  });
});
