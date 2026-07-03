import { fireEvent, render, waitFor } from '@testing-library/react-native';
import LeagueDetailsScreen from '../create-league/LeagueDetailsScreen';

const mockOpenPaywall = jest.fn();

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

jest.mock('@/lib/revenuecat/purchases', () => ({
  usePaywall: () => mockOpenPaywall,
  useRevenueCatSubscription: () => ({
    subscription: { isActive: false },
  }),
}));

describe('LeagueDetailsScreen', () => {
  beforeEach(() => {
    mockOpenPaywall.mockReset();
  });

  it('renders League Name input placeholder', () => {
    const { getByPlaceholderText } = render(<LeagueDetailsScreen />);
    expect(getByPlaceholderText('Enter league name')).toBeTruthy();
  });

  it('renders Nickname input placeholder', () => {
    const { getByPlaceholderText } = render(<LeagueDetailsScreen />);
    expect(getByPlaceholderText('Enter your nickname')).toBeTruthy();
  });

  it('renders member option buttons', () => {
    const { getByText } = render(<LeagueDetailsScreen />);
    expect(getByText('6 Members')).toBeTruthy();
    expect(getByText('12 Members')).toBeTruthy();
  });

  it('renders Create League submit button', () => {
    const { getByText } = render(<LeagueDetailsScreen />);
    expect(getByText('Create League')).toBeTruthy();
  });

  it('opens paywall when locked 12 Members option is pressed', async () => {
    mockOpenPaywall.mockResolvedValue(null);
    const { getByText } = render(<LeagueDetailsScreen />);

    fireEvent.press(getByText('12 Members'));

    await waitFor(() => {
      expect(mockOpenPaywall).toHaveBeenCalledTimes(1);
    });
  });
});
