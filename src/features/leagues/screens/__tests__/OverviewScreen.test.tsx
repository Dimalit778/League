import { render } from '@testing-library/react-native';
import { Image as ExpoImage } from 'expo-image';
import OverviewScreen from '../../../league-overview/screen/OverviewScreen';

jest.mock('expo-image', () => {
  const { Image } = require('react-native');
  Object.defineProperty(Image, 'prefetch', {
    value: jest.fn(() => Promise.resolve(true)),
    configurable: true,
  });
  return {
    Image,
  };
});

jest.mock('@/store/MemberStore', () => ({
  usePrimaryMember: () => ({
    memberId: 'm1',
    nickname: 'Player1',
    avatarUrl: null,
    leagueName: 'Test League',
    competitionName: 'Premier League',
    competitionArea: 'England',
    competitionLogo: null,
    competitionFlag: null,
  }),
}));

jest.mock('@/features/memberStats/hooks/useMemberStats', () => ({
  useMemberStats: () => ({
    data: {
      position: 4,
      totalPoints: 85,
      totalPredictions: 0,
      bingoHits: 0,
      regularHits: 0,
      missedHits: 0,
      accuracy: 0,
      pendingPredictions: 0,
    },
    isLoading: false,
  }),
}));

jest.mock('@/features/memberStats/components/StatsPredictionSection', () => ({
  StatsPredictionSection: () => null,
}));

jest.mock('@/features/league-overview/hooks/useLeagueOverview', () => ({
  useLeagueOverview: () => ({
    league: {
      id: 'l1',
      name: 'Test League',
      competitionId: 100,
      competitionName: 'Test Competition',
      logoUrl: '',
      flagUrl: '',
      isPrimary: true,
    },
    memberStats: {
      memberId: 'm1',
      nickname: 'Player1',
      avatarUrl: null,
      rank: 1,
      points: 100,
      pendingPredictions: 2,
    },
    leaderboard: [
      {
        league_id: 'l1',
        member_id: 'm1',
        user_id: 'u1',
        nickname: 'Player1',
        avatar_url: 'player-1.jpg',
        total_points: 100,
      },
      {
        league_id: 'l1',
        member_id: 'm2',
        user_id: 'u2',
        nickname: 'Player2',
        avatar_url: 'player-2.jpg',
        total_points: 80,
      },
    ],
    todayMatches: [],
  }),
}));

jest.mock('@/utils/getProfileImage', () => ({
  getProfileImage: (path?: string | null) => (path ? `https://example.com/${path}` : null),
}));

describe('OverviewScreen', () => {
  beforeEach(() => {
    jest.mocked(ExpoImage.prefetch).mockClear();
  });

  it('shows an empty state when there are no matches today', () => {
    const { getByText } = render(<OverviewScreen />);

    expect(getByText('No matches today')).toBeTruthy();
  });

  it('prefetches leaderboard avatar images in the background', () => {
    render(<OverviewScreen />);

    expect(ExpoImage.prefetch).toHaveBeenCalledWith(
      ['https://example.com/player-1.jpg', 'https://example.com/player-2.jpg'],
      { cachePolicy: 'memory-disk' },
    );
  });

  it('renders league name and current user nickname in the header', () => {
    const { getByText } = render(<OverviewScreen />);

    expect(getByText('Test League')).toBeTruthy();
    expect(getByText('Player1')).toBeTruthy();
  });
});
