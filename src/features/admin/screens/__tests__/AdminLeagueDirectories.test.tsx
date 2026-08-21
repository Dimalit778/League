import { fireEvent, render } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import AdminLeagueMembersScreen from '../AdminLeagueMembersScreen';
import AdminLeaguesScreen from '../AdminLeaguesScreen';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useLocalSearchParams: jest.fn(() => ({})),
}));

const mockLeagues = [
  {
    id: 'league-a',
    name: 'Alpha League',
    join_code: 'ALPHA1',
    owner: { full_name: 'Alice Admin', email: 'alice@example.com' },
    competition: { name: 'Premier League' },
  },
  {
    id: 'league-b',
    name: 'Beta League',
    join_code: 'BETA22',
    owner: { full_name: 'Bob Admin', email: 'bob@example.com' },
    competition: { name: 'Champions League' },
  },
];

const mockMembers = [
  {
    id: 'member-a',
    league_id: 'league-a',
    nickname: 'Alpha Player',
    is_primary: true,
    active: true,
    created_at: '2026-08-01T10:00:00Z',
    league: { id: 'league-a', name: 'Alpha League' },
    user: { full_name: 'A Player', email: 'alpha@example.com' },
  },
  {
    id: 'member-b',
    league_id: 'league-b',
    nickname: 'Beta Player',
    is_primary: false,
    active: true,
    created_at: '2026-08-02T10:00:00Z',
    league: { id: 'league-b', name: 'Beta League' },
    user: { full_name: 'B Player', email: 'beta@example.com' },
  },
];

jest.mock('@/features/admin/hooks/useAdmin', () => ({
  useAdminLeagues: () => ({
    data: mockLeagues,
    isLoading: false,
    isRefetching: false,
    error: null,
    refetch: jest.fn(),
  }),
  useAdminLeagueMembers: () => ({
    data: mockMembers,
    isLoading: false,
    isRefetching: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

describe('admin league directories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
  });

  it('shows every league and opens its filtered member directory', () => {
    const { getAllByText, getByText } = render(<AdminLeaguesScreen />);

    expect(getByText('Alpha League')).toBeTruthy();
    expect(getByText('Beta League')).toBeTruthy();

    fireEvent.press(getAllByText('View members')[0]);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/admin/league-members',
      params: { leagueId: 'league-a' },
    });
  });

  it('starts with the route league selected and can return to all members', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ leagueId: 'league-b' });
    const { getByText, queryByText } = render(<AdminLeagueMembersScreen />);

    expect(getByText('Beta Player')).toBeTruthy();
    expect(queryByText('Alpha Player')).toBeNull();

    fireEvent.press(getByText('All leagues'));

    expect(getByText('Alpha Player')).toBeTruthy();
    expect(getByText('Beta Player')).toBeTruthy();
  });
});
