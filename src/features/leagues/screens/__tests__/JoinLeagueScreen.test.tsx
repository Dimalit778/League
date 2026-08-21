import { render } from '@testing-library/react-native';
import JoinLeagueScreen from '../JoinLeagueScreen';

jest.mock('@/features/leagues/hooks/useLeagues', () => ({
  useFindLeagueByJoinCode: () => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
  useJoinLeague: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}));

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useWatch: jest.fn(() => ''),
}));

describe('JoinLeagueScreen', () => {
  it('renders Invite Code heading', () => {
    const { getByText } = render(<JoinLeagueScreen />);
    expect(getByText('Invite Code')).toBeTruthy();
  });

  it('renders invite code input placeholder', () => {
    const { getByPlaceholderText } = render(<JoinLeagueScreen />);
    expect(getByPlaceholderText('Enter 7-digit invite code')).toBeTruthy();
  });

  it('renders how to join section', () => {
    const { getByText } = render(<JoinLeagueScreen />);
    expect(getByText('How to Join a League')).toBeTruthy();
  });

  it('renders invite-code guidance', () => {
    const { getByText } = render(<JoinLeagueScreen />);
    expect(getByText('Ask the league owner for the invite code')).toBeTruthy();
  });
});
