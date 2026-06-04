import { render } from '@testing-library/react-native';
import MyLeagueScreen from '../MyLeaguesScreen';

type TestNode = {
  props: {
    style?: {
      width?: string;
    };
  };
};

let mockLeagues: any[] = [];
let mockLimitState = {
  limit: 1,
  reachedLimit: false,
  usagePercent: 0,
  ownedLeaguesCount: 0,
};

jest.mock('@/store/AuthStore', () => ({
  useAuthStore: (selector: (state: { user?: { id: string }; isAuthLoading: boolean }) => unknown) =>
    selector({ user: { id: 'user-1' }, isAuthLoading: false }),
}));

jest.mock('@/store/MemberStore', () => ({
  useMemberStore: () => ({
    activeMember: null,
    setActiveMember: jest.fn(),
  }),
}));

jest.mock('@/features/leagues/hooks/useLeagues', () => ({
  useMyLeagues: () => ({
    data: mockLeagues,
    isPending: false,
    isFetching: false,
    error: null,
    refetch: jest.fn(),
  }),
  useUpdatePrimaryLeague: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}));

jest.mock('@/features/subscription/hooks/useSubscription', () => ({
  useSubscriptionLimit: () => mockLimitState,
  useSubscription: () => ({ data: { type: 'FREE', limits: {} } }),
  usePurchaseAndSyncSubscription: () => jest.fn(),
}));

describe('MyLeagueScreen', () => {
  beforeEach(() => {
    mockLeagues = [];
    mockLimitState = {
      limit: 1,
      reachedLimit: false,
      usagePercent: 0,
      ownedLeaguesCount: 0,
    };
  });

  it('renders Create League button', () => {
    const { getByText } = render(<MyLeagueScreen />);
    expect(getByText('Create League')).toBeTruthy();
  });

  it('renders Join League button', () => {
    const { getByText } = render(<MyLeagueScreen />);
    expect(getByText('Join League')).toBeTruthy();
  });

  it('renders empty state message when no leagues', () => {
    const { getByText } = render(<MyLeagueScreen />);
    expect(getByText('Create or join a league to get started')).toBeTruthy();
  });

  it('does not render an infinite progress width when subscription limit is zero', () => {
    mockLimitState = {
      limit: 0,
      reachedLimit: false,
      usagePercent: 0,
      ownedLeaguesCount: 0,
    };

    const { UNSAFE_root } = render(<MyLeagueScreen />);
    const progressViews = UNSAFE_root.findAll((node: TestNode) => node.props?.style?.width !== undefined);

    expect(progressViews.some((node: TestNode) => node.props.style?.width === 'Infinity%')).toBe(false);
    expect(progressViews.some((node: TestNode) => node.props.style?.width === '0%')).toBe(true);
  });
});
