import { render } from '@testing-library/react-native';
import LeagueScreen from '../../screens/LeagueScreen';

jest.mock('@/store/MemberStore', () => ({
  useMemberStore: () => ({
    leagueId: 'l1',
    memberId: 'm1',
  }),
}));

jest.mock('@/features/leagues/hooks/useLeagues', () => ({
  useGetLeaderboard: () => ({
    data: [
      { member_id: 'm1', nickname: 'Player1', avatar_url: null, total_points: 100 },
      { member_id: 'm2', nickname: 'Player2', avatar_url: null, total_points: 80 },
    ],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

jest.mock('@/features/leagues/components/TopThree', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: () => <Text>TopThree</Text>,
  };
});

describe('LeagueScreen', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<LeagueScreen />);
    expect(getByText('TopThree')).toBeTruthy();
  });
});
