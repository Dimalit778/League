import { render } from '@testing-library/react-native';
import MyLeagueScreen from '../MyLeaguesScreen';

type TestNode = {
  props: {
    style?: {
      width?: string;
    };
  };
};

let mockScreenState = {
  isLoading: false,
  error: null as Error | null,
  allLeagues: [] as unknown[],
  activeCount: 0,
  maxLeagues: 1,
  hasPrimaryMember: false,
  selectLeague: jest.fn(),
  upgrade: jest.fn(),
  limitSelect: null as null,
};

jest.mock('@/features/leagues/hooks/useMyLeaguesScreen', () => ({
  useMyLeaguesScreen: () => mockScreenState,
}));

describe('MyLeagueScreen', () => {
  beforeEach(() => {
    mockScreenState = {
      isLoading: false,
      error: null,
      allLeagues: [],
      activeCount: 0,
      maxLeagues: 1,
      hasPrimaryMember: false,
      selectLeague: jest.fn(),
      upgrade: jest.fn(),
      limitSelect: null,
    };
  });

  it('renders Create League button', () => {
    const { getAllByText } = render(<MyLeagueScreen />);
    expect(getAllByText('Create League').length).toBeGreaterThan(0);
  });

  it('renders Join League button', () => {
    const { getAllByText } = render(<MyLeagueScreen />);
    expect(getAllByText('Join League').length).toBeGreaterThan(0);
  });

  it('renders empty state message when no leagues', () => {
    const { getByText } = render(<MyLeagueScreen />);
    expect(getByText('Create or join a league to get started.')).toBeTruthy();
  });

  it('does not render an infinite progress width when subscription limit is zero', () => {
    mockScreenState = {
      ...mockScreenState,
      maxLeagues: 0,
    };

    const { UNSAFE_root } = render(<MyLeagueScreen />);
    const progressViews = UNSAFE_root.findAll((node: TestNode) => node.props?.style?.width !== undefined);

    expect(progressViews.some((node: TestNode) => node.props.style?.width === 'Infinity%')).toBe(false);
  });
});
