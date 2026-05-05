import { render } from '@testing-library/react-native';
import MyLeagueScreen from '../../screens/MyLeagueScreen';

type TestNode = {
  props: {
    style?: {
      width?: string;
    };
  };
};

let mockLeagues: any[] = [];
let mockSubscription: any = { limits: { maxLeagues: 0 } };

jest.mock('@/store/MemberStore', () => ({
  useMemberStore: () => ({
    setActiveMember: jest.fn(),
  }),
}));

jest.mock('@/features/leagues/hooks/useLeagues', () => ({
  useMyLeagues: () => ({
    data: mockLeagues,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
  useUpdatePrimaryLeague: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

jest.mock('@/features/subscription/hooks/useSubscription', () => ({
  useSubscription: () => ({
    data: mockSubscription,
    isLoading: false,
  }),
}));

describe('MyLeagueScreen', () => {
  beforeEach(() => {
    mockLeagues = [];
    mockSubscription = { limits: { maxLeagues: 0 } };
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
    const { UNSAFE_root } = render(<MyLeagueScreen />);
    const progressViews = UNSAFE_root.findAll((node: TestNode) => node.props?.style?.width !== undefined);

    expect(progressViews.some((node: TestNode) => node.props.style?.width === 'Infinity%')).toBe(false);
    expect(progressViews.some((node: TestNode) => node.props.style?.width === '0%')).toBe(true);
  });
});
