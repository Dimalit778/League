import { render } from '@testing-library/react-native';
import EditLeagueScreen from '@/features/leagues/screens/EditLeagueScreen';

// `mock`-prefixed so it can be referenced inside the hoisted jest.mock factory.
let mockUserId = 'owner-user-1';

jest.mock('@/features/leagues/hooks/useLeagues', () => ({
  useGetLeagueAndMembers: () => ({
    data: {
      id: 'league-1',
      name: 'My League',
      owner_id: 'owner-user-1',
      join_code: 'ABC123',
      competition: { name: 'Premier League', area: 'England', logo: '' },
      league_members: [
        { id: 'm1', user_id: 'owner-user-1', nickname: 'Owner', avatar_url: null },
        { id: 'm2', user_id: 'other-user-2', nickname: 'Member', avatar_url: null },
      ],
    },
    isLoading: false,
    error: null,
  }),
  useLeaveLeague: () => ({ mutate: jest.fn(), isPending: false }),
  useDeleteLeague: () => ({ mutate: jest.fn(), isPending: false }),
  useRemoveMember: () => ({ mutate: jest.fn(), isPending: false }),
  useUpdateLeague: () => ({ mutate: jest.fn(), isPending: false }),
}));

// Mirror the real MemberStore selector shape: selectMemberUserId -> primaryMember.userId
jest.mock('@/store/MemberStore', () => ({
  useMemberStore: (selector: any) =>
    selector({ primaryMember: { userId: mockUserId, leagueId: 'league-1' } }),
  selectMemberUserId: (s: any) => s.primaryMember?.userId,
  selectLeagueId: (s: any) => s.primaryMember?.leagueId,
}));

describe('EditLeagueScreen permissions', () => {
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
  });
});
