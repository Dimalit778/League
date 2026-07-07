import { render } from '@testing-library/react-native';
import { Image as ExpoImage } from 'expo-image';
import OverviewScreen from '../../../league-overview/screen/OverviewScreen';
import { LeaderboardRow } from '../../types';

let mockLeaderboard: LeaderboardRow[] = [];

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
    userId: 'u1',
    isPrimary: true,
    active: true,
    nickname: 'Player1',
    avatarUrl: null,
    createdAt: '2026-01-01',
    leagueId: 'l1',
    leagueName: 'Test League',
    competitionId: 100,
    competitionName: 'Test Competition',
    competitionLogo: null,
    competitionFlag: null,
    competitionArea: null,
    competitionType: 'league',
  }),
}));

jest.mock('@/components/layout', () => {
  const { View } = require('react-native');
  return {
    Screen: ({ children }: { children: any }) => <View>{children}</View>,
    useFloatBottomTabsInset: () => 0,
  };
});

jest.mock('@/features/leagues/hooks/useLeagues', () => ({
  useGetLeaderboard: () => ({
    data: mockLeaderboard,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

jest.mock('@/features/members/hooks/useMembers', () => ({
  useMemberStats: () => ({
    data: { position: 1, totalPoints: 100, pendingPredictions: 2 },
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/features/matches/hooks/useMatches', () => ({
  useGetTodayMatches: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/utils/getProfileImage', () => ({
  getProfileImage: (path?: string | null) => (path ? `https://example.com/${path}` : null),
}));

describe('OverviewScreen', () => {
  beforeEach(() => {
    mockLeaderboard = [
      { league_id: 'l1', member_id: 'm1', user_id: 'u1', nickname: 'Player1', avatar_url: null, total_points: 100 },
      { league_id: 'l1', member_id: 'm2', user_id: 'u2', nickname: 'Player2', avatar_url: null, total_points: 80 },
    ];
    jest.mocked(ExpoImage.prefetch).mockClear();
  });

  it('renders the league name and leaderboard', () => {
    const { getByText, getAllByText } = render(<OverviewScreen />);

    expect(getByText('Test League')).toBeTruthy();
    expect(getByText('Top leaderboard')).toBeTruthy();
    expect(getAllByText('Player1').length).toBeGreaterThan(0);
    expect(getByText('Player2')).toBeTruthy();
  });

  it('renders immediately while avatar images prefetch in the background', () => {
    mockLeaderboard = [
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
    ];

    jest.mocked(ExpoImage.prefetch).mockImplementationOnce(() => new Promise(() => {}));

    const { getByText } = render(<OverviewScreen />);

    expect(getByText('Player2')).toBeTruthy();
    expect(ExpoImage.prefetch).toHaveBeenCalledWith(
      ['https://example.com/player-1.jpg', 'https://example.com/player-2.jpg'],
      { cachePolicy: 'memory-disk' },
    );
  });

  it('still renders the leaderboard if avatar prefetch fails', () => {
    mockLeaderboard = [
      {
        league_id: 'l1',
        member_id: 'm1',
        user_id: 'u1',
        nickname: 'Player1',
        avatar_url: 'player-1.jpg',
        total_points: 100,
      },
    ];
    jest.mocked(ExpoImage.prefetch).mockRejectedValueOnce(new Error('prefetch failed'));

    const { getAllByText } = render(<OverviewScreen />);

    expect(getAllByText('Player1').length).toBeGreaterThan(0);
  });

  it('shows an empty state when there are no matches today', () => {
    const { getByText } = render(<OverviewScreen />);

    expect(getByText('No matches today')).toBeTruthy();
  });
});
