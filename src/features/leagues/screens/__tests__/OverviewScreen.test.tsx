import { render } from '@testing-library/react-native';
import OverviewScreen from '../OverviewScreen';

const mockOverview = {
  leagueSummary: {
    nickname: 'Player1',
    avatarUrl: null,
    leagueName: 'Test League',
    flagUrl: '',
    rank: 1,
    points: 100,
    membersCount: 12,
  },
  stats: {
    totalPredictions: 10,
    bingoHits: 2,
    regularHits: 5,
    missedHits: 3,
    accuracy: 70,
    totalPoints: 100,
    pendingPredictions: 0,
    rank: 1,
    totalMembers: 12,
    currentStreak: 3,
    longestStreak: 5,
    recentForm: [],
  },
  todayMatches: [],
  isLoading: false,
};

jest.mock('../../hooks/useLeagueOverview', () => ({
  useLeagueOverview: () => mockOverview,
}));

jest.mock('@/store/PrimaryLeagueStore', () => ({
  useMemberId: () => 'member-1',
}));

jest.mock('@/components/ui/HeaderBackground', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    HeaderBackground: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

describe('OverviewScreen', () => {
  it('renders the league summary', () => {
    const { getAllByText, getByText } = render(<OverviewScreen />);

    expect(getAllByText('Player1').length).toBeGreaterThan(0);
    expect(getByText('#1')).toBeTruthy();
    expect(getByText('100')).toBeTruthy();
    expect(getByText('12')).toBeTruthy();
  });

  it('shows the matches empty state', () => {
    const { getByText } = render(<OverviewScreen />);
    expect(getByText('No matches today')).toBeTruthy();
  });

  it('renders sections in the intended hierarchy', () => {
    const { getAllByText, getByText } = render(<OverviewScreen />);

    expect(getByText('Today matches')).toBeTruthy();
    expect(getAllByText('Stats').length).toBeGreaterThan(0);
    expect(getByText('Current form')).toBeTruthy();
  });
});
