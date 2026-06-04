import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import SelectCompetitionScreen from '../../screens/SelectCompetitionScreen';

const mockPush = router.push as jest.Mock;

jest.mock('@/features/leagues/hooks/useCompetition', () => ({
  useGetCompetitions: () => ({
    data: [
      {
        id: 1,
        name: 'Premier League',
        logo: 'https://example.com/pl.png',
        flag: 'https://example.com/gb.png',
        area: 'England',
        is_free: true,
      },
      {
        id: 2,
        name: 'La Liga',
        logo: 'https://example.com/ll.png',
        flag: 'https://example.com/es.png',
        area: 'Spain',
        is_free: false,
      },
      {
        id: 1_000,
        name: 'World Cup',
        logo: 'https://example.com/wc.png',
        flag: 'https://example.com/un.png',
        area: 'World',
        is_free: true,
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/features/subscription/hooks/useSubscription', () => ({
  useSubscription: () => ({ data: { type: 'FREE' } }),
  usePurchaseAndSyncSubscription: () => jest.fn().mockResolvedValue(null),
}));

describe('SelectCompetitionScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders Continue button', () => {
    const { getByText } = render(<SelectCompetitionScreen />);
    expect(getByText('Continue')).toBeTruthy();
  });

  it('renders competition names', () => {
    const { getByText } = render(<SelectCompetitionScreen />);
    expect(getByText('Premier League')).toBeTruthy();
    expect(getByText('La Liga')).toBeTruthy();
    expect(getByText('World Cup')).toBeTruthy();
  });

  it('navigates to create league with the selected World Cup competition id', () => {
    const { getByText } = render(<SelectCompetitionScreen />);

    fireEvent.press(getByText('World Cup'));
    fireEvent.press(getByText('Continue'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(app)/(public)/myLeagues/create-league',
      params: {
        competitionId: 1_000,
      },
    });
  });
});
