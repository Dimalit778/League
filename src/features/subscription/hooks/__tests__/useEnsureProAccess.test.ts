import { renderHook } from '@testing-library/react-native';
import { useEnsureProAccess } from '../useEnsureProAccess';
import { syncSubscriptionToServerUntilPro } from '@/features/subscription/api/subscriptionApi';

const mockOpenPaywall = jest.fn();

jest.mock('@/features/subscription/api/subscriptionApi', () => ({
  syncSubscriptionToServerUntilPro: jest.fn(),
}));

jest.mock('@/lib/revenuecat/purchases', () => ({
  PRO_ENTITLEMENT: 'pro',
  hasActiveEntitlement: jest.fn(),
  usePaywall: () => mockOpenPaywall,
  useRevenueCatSubscription: () => ({
    subscription: { isActive: true },
    refreshCustomerInfo: jest.fn(),
  }),
}));

const mockedSync = syncSubscriptionToServerUntilPro as jest.Mock;

describe('useEnsureProAccess (server-first)', () => {
  afterEach(() => jest.clearAllMocks());

  it('grants access without opening the paywall when the server confirms Pro', async () => {
    mockedSync.mockResolvedValue({ plan: 'pro', status: 'active', expires_at: '2999-01-01T00:00:00Z' });
    const { result } = renderHook(() => useEnsureProAccess());

    await expect(result.current.ensureProAccess()).resolves.toBe(true);
    expect(mockOpenPaywall).not.toHaveBeenCalled();
  });

  it('opens the paywall when the server says free even though RevenueCat looks active', async () => {
    mockedSync.mockResolvedValue({ plan: 'free', status: 'expired', expires_at: '2020-01-01T00:00:00Z' });
    mockOpenPaywall.mockResolvedValue(true);
    const { result } = renderHook(() => useEnsureProAccess());

    await expect(result.current.ensureProAccess()).resolves.toBe(true);
    expect(mockOpenPaywall).toHaveBeenCalledTimes(1);
  });

  it('opens the paywall when the server sync throws', async () => {
    mockedSync.mockRejectedValue(new Error('offline'));
    mockOpenPaywall.mockResolvedValue(false);
    const { result } = renderHook(() => useEnsureProAccess());

    await expect(result.current.ensureProAccess()).resolves.toBe(false);
    expect(mockOpenPaywall).toHaveBeenCalledTimes(1);
  });
});
