import { renderHook } from '@testing-library/react-native';
import { useEnsureProAccess } from '../useEnsureProAccess';

const mockOpenPaywall = jest.fn();

jest.mock('../../subscriptionMode', () => ({
  SUBSCRIPTIONS_ENABLED: false,
}));

jest.mock('../useSubscriptionAccess', () => ({
  useSubscriptionAccess: () => ({ data: { planCode: 'free' } }),
}));

jest.mock('@/lib/revenuecat/purchases', () => ({
  usePaywall: () => mockOpenPaywall,
}));

describe('useEnsureProAccess in free-access mode', () => {
  it('grants full access without opening the paywall', async () => {
    const { result } = renderHook(() => useEnsureProAccess());

    expect(result.current.isPro).toBe(true);
    await expect(result.current.ensureProAccess()).resolves.toBe(true);
    expect(mockOpenPaywall).not.toHaveBeenCalled();
  });
});
