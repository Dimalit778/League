import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { getMySubscriptionAccess } from '../../api/subscriptionApi';
import { useSubscriptionAccess } from '../useSubscriptionAccess';

jest.mock('../../subscriptionMode', () => ({
  SUBSCRIPTIONS_ENABLED: false,
  DEFAULT_PRO_ACCESS: {
    planCode: 'pro',
    isDefault: false,
    status: 'free_access',
    expiresAt: null,
    limits: {
      maxActiveLeagues: 5,
      maxMembersPerLeague: 12,
      weeklyAiAnalyses: null,
    },
    capabilities: {
      premiumCompetitions: true,
      advancedStats: true,
    },
  },
}));

jest.mock('../../api/subscriptionApi', () => ({
  getMySubscriptionAccess: jest.fn(),
}));

jest.mock('@/store/AuthStore', () => ({
  useAuthStore: (selector: (state: { user: { id: string } }) => unknown) =>
    selector({ user: { id: 'user-1' } }),
}));

describe('useSubscriptionAccess in free-access mode', () => {
  it('returns Pro immediately without requesting subscription data', () => {
    const mockedUseQuery = useQuery as jest.Mock;
    mockedUseQuery.mockImplementationOnce((options) => ({
      data: options.initialData,
      isPending: false,
    }));

    const { result } = renderHook(() => useSubscriptionAccess());

    expect(result.current.data?.planCode).toBe('pro');
    expect(result.current.data?.status).toBe('free_access');
    expect(getMySubscriptionAccess).not.toHaveBeenCalled();
  });
});
