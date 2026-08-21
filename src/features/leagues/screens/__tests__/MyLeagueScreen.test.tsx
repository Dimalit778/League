import { fireEvent, render } from '@testing-library/react-native';
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
  isPro: false,
  maxLeagues: 1,
  hasPrimaryMember: false,
  selectLeague: jest.fn(),
  upgrade: jest.fn(),
  activationSelection: null as null | {
    availableSlots: number;
    selectedMemberIds: string[];
    isSaving: boolean;
    canSave: boolean;
    onToggleLeague: jest.Mock;
    onSave: jest.Mock;
  },
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
      isPro: false,
      maxLeagues: 1,
      hasPrimaryMember: false,
      selectLeague: jest.fn(),
      upgrade: jest.fn(),
      activationSelection: null,
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
    expect(getByText('No leagues found')).toBeTruthy();
    expect(getByText('Create a league to get started')).toBeTruthy();
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

  it('hides create and upgrade actions for pro users at their league limit', () => {
    mockScreenState = {
      ...mockScreenState,
      isPro: true,
      activeCount: 5,
      maxLeagues: 5,
    };

    const { queryByText } = render(<MyLeagueScreen />);
    expect(queryByText('Upgrade to Pro')).toBeNull();
    expect(queryByText('Create League')).toBeNull();
  });

  it('shows the activate button after an inactive league is selected', () => {
    const onSave = jest.fn();
    mockScreenState = {
      ...mockScreenState,
      activeCount: 1,
      maxLeagues: 2,
      activationSelection: {
        availableSlots: 1,
        selectedMemberIds: ['inactive-member'],
        isSaving: false,
        canSave: true,
        onToggleLeague: jest.fn(),
        onSave,
      },
    };

    const { getByText } = render(<MyLeagueScreen />);
    fireEvent.press(getByText('Activate league'));

    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
