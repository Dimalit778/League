import { render } from '@testing-library/react-native';
import MyLeagueScreen from '../../screens/MyLeagueScreen';

jest.mock('@/store/MemberStore', () => ({
  useMemberStore: () => ({
    setActiveMember: jest.fn(),
  }),
}));

jest.mock('@/features/leagues/hooks/useLeagues', () => ({
  useMyLeagues: () => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
  useUpdatePrimaryLeague: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

describe('MyLeagueScreen', () => {
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
});
