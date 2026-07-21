import { render } from '@testing-library/react-native';
import OverviewScreen from '@/features/league-overview/screen/OverviewScreen';

jest.mock('@/features/league-overview/hooks/useLeagueOverview', () => ({
  useLeagueOverview: () => ({
    header: {
      nickname: 'Tester',
      avatarUrl: null,
      leagueName: 'My League',
      logoUrl: '',
      flagUrl: '',
      rank: 3,
      points: 42,
      membersCount: 8,
    },
    stats: undefined,
    upcomingMatches: [],
    isLoading: false,
  }),
}));

// Heavy SVG section — stub so the screen test focuses on composition.
jest.mock('@/features/memberStats/components/StatsPredictionSection', () => {
  const { Text } = require('react-native');
  return { StatsPredictionSection: () => <Text>stats-section</Text> };
});

describe('OverviewScreen', () => {
  it('renders the three sections without crashing', () => {
    const { queryByText, queryAllByText } = render(<OverviewScreen />);
    expect(queryAllByText('My League').length).toBeGreaterThan(0); // Header
    expect(queryByText('stats-section')).toBeTruthy(); // Stats
    expect(queryByText('No matches today')).toBeTruthy(); // UpcomingMatches empty state
  });
});
