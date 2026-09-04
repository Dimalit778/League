import { fireEvent, render } from '@testing-library/react-native';
import EditLeagueScreen from '@/features/leagues/screens/EditLeagueScreen';

let mockUserId = 'owner-user-1';
let mockQueryError: Error | null = null;
let mockMissingLeague = false;
const mockRefetch = jest.fn();

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/features/leagues/hooks/useLeagues', () => ({
  useGetLeagueAndMembers: () => ({
    data: mockMissingLeague ? undefined : {
      id: 'league-1',
      name: 'My League',
      owner_id: 'owner-user-1',
      join_code: 'ABC123',
      competition: { name: 'Premier League', area: 'England', flag: '' },
      league_members: [
        { id: 'm1', user_id: 'owner-user-1', nickname: 'Owner', avatar_url: null },
        { id: 'm2', user_id: 'other-user-2', nickname: 'Member', avatar_url: null },
      ],
    },
    isLoading: false,
    error: mockQueryError,
    isFetching: false,
    refetch: mockRefetch,
  }),
  useLeaveLeague: () => ({ mutate: jest.fn(), isPending: false }),
  useDeleteLeague: () => ({ mutate: jest.fn(), isPending: false }),
  useRemoveMember: () => ({ mutate: jest.fn(), isPending: false }),
  useUpdateLeague: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock('@/store/PrimaryLeagueStore', () => ({
  useLeagueId: () => 'league-1',
}));

jest.mock('@/store/AuthStore', () => ({
  useAuthStore: (selector: any) => selector({ user: { id: mockUserId } }),
}));

describe('EditLeagueScreen permissions and load failures', () => {
  beforeEach(() => {
    mockQueryError = null;
    mockMissingLeague = false;
    mockRefetch.mockClear();
  });

  it('shows a failed initial request and allows retry instead of loading forever', () => {
    mockMissingLeague = true;
    mockQueryError = new Error('Network request failed');
    const { getByText, queryByText, rerender } = render(<EditLeagueScreen />);
    expect(getByText(/connection/i)).toBeTruthy();
    fireEvent.press(getByText('Try again'));
    expect(mockRefetch).toHaveBeenCalledTimes(1);

    mockMissingLeague = false;
    mockQueryError = null;
    rerender(<EditLeagueScreen />);
    expect(getByText('ABC123')).toBeTruthy();
    expect(queryByText('Try again')).toBeNull();
  });

  it('shows a missing league instead of an indefinite skeleton', () => {
    mockMissingLeague = true;
    const { getByText } = render(<EditLeagueScreen />);
    expect(getByText('League not found')).toBeTruthy();
  });
  it('owner sees Delete League and join code, not Leave', () => {
    mockUserId = 'owner-user-1';
    const { queryByText } = render(<EditLeagueScreen />);
    expect(queryByText('Delete League')).toBeTruthy();
    expect(queryByText('ABC123')).toBeTruthy();
    expect(queryByText('Leave league')).toBeNull();
  });

  it('non-owner sees Leave league and join code, not Delete', () => {
    mockUserId = 'other-user-2';
    const { queryByText } = render(<EditLeagueScreen />);
    expect(queryByText('Leave league')).toBeTruthy();
    expect(queryByText('ABC123')).toBeTruthy();
    expect(queryByText('Delete League')).toBeNull();
    expect(queryByText('Report league name')).toBeTruthy();
  });
});
