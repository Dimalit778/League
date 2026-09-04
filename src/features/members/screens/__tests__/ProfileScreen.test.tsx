import { render } from '@testing-library/react-native';
import ProfileScreen from '../ProfileScreen';

jest.mock('@/store/PrimaryLeagueStore', () => ({ useMemberId: () => 'member-1', useLeagueId: () => 'league-1' }));

let mockMemberError: Error | null = null;
let mockLeagueError: Error | null = null;
jest.mock('@/features/members/hooks/useMembers', () => ({
  useGetMember: () => ({ data: undefined, isLoading: false, error: mockMemberError }),
}));
jest.mock('@/features/members/hooks/useMemberStats', () => ({
  useMemberStats: () => ({ data: {}, isLoading: false, error: null }),
}));
jest.mock('@/features/leagues/hooks/useLeagues', () => ({
  useGetLeagueAndMembers: () => ({ data: undefined, isLoading: false, error: mockLeagueError }),
  useLeaveLeague: () => ({ mutate: jest.fn() }),
}));

describe('ProfileScreen failed initial loads', () => {
  beforeEach(() => { mockMemberError = null; mockLeagueError = null; });
  it('shows a member request failure instead of an endless skeleton', () => {
    mockMemberError = new Error('Member request failed');
    expect(render(<ProfileScreen />).getByText('Member request failed')).toBeTruthy();
  });
  it('shows a league request failure instead of an endless skeleton', () => {
    mockLeagueError = new Error('League request failed');
    expect(render(<ProfileScreen />).getByText('League request failed')).toBeTruthy();
  });
  it('handles a missing member after loading has finished', () => {
    expect(render(<ProfileScreen />).getByText('Member not found')).toBeTruthy();
  });
});
