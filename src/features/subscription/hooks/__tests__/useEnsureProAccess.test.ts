import { renderHook } from '@testing-library/react-native';
import { useEnsureProAccess } from '../useEnsureProAccess';

const mockOpenPaywall = jest.fn();
const mockUseSubscriptionAccess = jest.fn();

jest.mock('../useSubscriptionAccess', () => ({
  useSubscriptionAccess: () => mockUseSubscriptionAccess(),
}));

jest.mock('@/lib/revenuecat/purchases', () => ({
  PRO_ENTITLEMENT: 'pro',
  hasActiveEntitlement: jest.fn(),
  usePaywall: () => mockOpenPaywall,
}));

describe('useEnsureProAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSubscriptionAccess.mockReturnValue({ data: { planCode: 'free' } });
  });

  it('grants access without opening the paywall when cached server access is Pro', async () => {
    mockUseSubscriptionAccess.mockReturnValue({ data: { planCode: 'pro' } });
    const { result } = renderHook(() => useEnsureProAccess());

    await expect(result.current.ensureProAccess()).resolves.toBe(true);
    expect(mockOpenPaywall).not.toHaveBeenCalled();
  });

  it('opens the paywall immediately when cached server access is Free', async () => {
    mockOpenPaywall.mockResolvedValue(true);
    const { result } = renderHook(() => useEnsureProAccess());

    await expect(result.current.ensureProAccess()).resolves.toBe(true);
    expect(mockOpenPaywall).toHaveBeenCalledTimes(1);
  });

  it('opens the paywall when subscription access has not loaded yet', async () => {
    mockUseSubscriptionAccess.mockReturnValue({ data: undefined });
    mockOpenPaywall.mockResolvedValue(false);
    const { result } = renderHook(() => useEnsureProAccess());

    await expect(result.current.ensureProAccess()).resolves.toBe(false);
    expect(mockOpenPaywall).toHaveBeenCalledTimes(1);
  });
});
