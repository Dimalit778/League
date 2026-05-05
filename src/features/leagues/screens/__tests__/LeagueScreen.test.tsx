import { act, render, waitFor } from '@testing-library/react-native';
import { Image as ExpoImage } from 'expo-image';
import LeagueScreen from '../../screens/LeagueScreen';

let mockLeaderboard = [
  { member_id: 'm1', nickname: 'Player1', avatar_url: null, total_points: 100 },
  { member_id: 'm2', nickname: 'Player2', avatar_url: null, total_points: 80 },
];

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
  useMemberStore: () => ({
    leagueId: 'l1',
    memberId: 'm1',
  }),
}));

jest.mock('@/components/layout', () => {
  const { Text, View } = require('react-native');
  return {
    Error: ({ error }: { error: Error }) => <Text>{error.message}</Text>,
    Screen: ({ children }: { children: any }) => <View>{children}</View>,
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

jest.mock('@/features/leagues/components/LeagueSkeleton', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: () => <Text>LeagueSkeleton</Text>,
  };
});

jest.mock('@/features/leagues/components/TopThree', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: () => <Text>TopThree</Text>,
  };
});

jest.mock('../../components/LeaderboardCard', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ item }: { item: { nickname: string } }) => <Text>{item.nickname}</Text>,
  };
});

jest.mock('@/utils/getProfileImage', () => ({
  getProfileImage: (path?: string | null) => (path ? `https://example.com/${path}` : null),
}));

describe('LeagueScreen', () => {
  beforeEach(() => {
    mockLeaderboard = [
      { member_id: 'm1', nickname: 'Player1', avatar_url: null, total_points: 100 },
      { member_id: 'm2', nickname: 'Player2', avatar_url: null, total_points: 80 },
    ];
    jest.mocked(ExpoImage.prefetch).mockClear();
  });

  it('renders without crashing', () => {
    const { getByText } = render(<LeagueScreen />);
    expect(getByText('TopThree')).toBeTruthy();
  });

  it('keeps the skeleton visible until avatar images are prefetched', async () => {
    mockLeaderboard = [
      { member_id: 'm1', nickname: 'Player1', avatar_url: 'player-1.jpg', total_points: 100 },
      { member_id: 'm2', nickname: 'Player2', avatar_url: 'player-2.jpg', total_points: 80 },
    ];

    let resolvePrefetch: (value: boolean) => void = () => {};
    jest.mocked(ExpoImage.prefetch).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePrefetch = resolve;
        })
    );

    const { getByText, queryByText } = render(<LeagueScreen />);

    expect(getByText('LeagueSkeleton')).toBeTruthy();
    expect(queryByText('TopThree')).toBeNull();
    expect(ExpoImage.prefetch).toHaveBeenCalledWith(
      ['https://example.com/player-1.jpg', 'https://example.com/player-2.jpg'],
      { cachePolicy: 'memory-disk' }
    );

    act(() => {
      resolvePrefetch(true);
    });

    await waitFor(() => {
      expect(getByText('TopThree')).toBeTruthy();
    });
  });
});
