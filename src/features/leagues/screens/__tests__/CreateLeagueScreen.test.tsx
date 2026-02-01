import { render } from '@testing-library/react-native';
import CreateLeagueScreen from '../../screens/CreateLeagueScreen';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useLocalSearchParams: () => ({ competitionId: '1' }),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('@/features/leagues/hooks/useLeagues', () => ({
  useCreateLeague: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}));

describe('CreateLeagueScreen', () => {
  it('renders League Name input placeholder', () => {
    const { getByPlaceholderText } = render(<CreateLeagueScreen />);
    expect(getByPlaceholderText('Enter league name')).toBeTruthy();
  });

  it('renders Nickname input placeholder', () => {
    const { getByPlaceholderText } = render(<CreateLeagueScreen />);
    expect(getByPlaceholderText('Enter your nickname')).toBeTruthy();
  });

  it('renders member option buttons', () => {
    const { getByText } = render(<CreateLeagueScreen />);
    expect(getByText('6 Members')).toBeTruthy();
    expect(getByText('10 Members')).toBeTruthy();
  });

  it('renders Create League submit button', () => {
    const { getByText } = render(<CreateLeagueScreen />);
    expect(getByText('Create League')).toBeTruthy();
  });
});
