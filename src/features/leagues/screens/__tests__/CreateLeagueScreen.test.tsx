import { fireEvent, render, waitFor } from '@testing-library/react-native';
import CreateLeagueScreen from '../../screens/CreateLeagueScreen';

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

jest.mock('@/features/subscription/components/UpgradeSubscriptionOverlay', () => ({
  UpgradeSubscriptionOverlay: () => null,
}));

jest.mock('@/features/subscription/hooks/useSubscription', () => ({
  useSubscription: () => ({ data: { type: 'FREE', limits: { maxMembersPerLeague: [6] } } }),
  useCanCreateLeague: () => ({ data: { canCreate: true }, isLoading: false }),
  usePurchaseAndSyncSubscription: () => ({
    mutateAsync: mockOpenPaywall,
  }),
}));

describe('CreateLeagueScreen', () => {
  beforeEach(() => {
    mockOpenPaywall.mockReset();
  });

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
    expect(getByText('12 Members')).toBeTruthy();
  });

  it('renders Create League submit button', () => {
    const { getByText } = render(<CreateLeagueScreen />);
    expect(getByText('Create League')).toBeTruthy();
  });

  it('opens paywall when locked 12 Members option is pressed', async () => {
    mockOpenPaywall.mockResolvedValue(null);
    const { getByText } = render(<CreateLeagueScreen />);

    fireEvent.press(getByText('12 Members'));

    await waitFor(() => {
      expect(mockOpenPaywall).toHaveBeenCalledTimes(1);
    });
  });
});
