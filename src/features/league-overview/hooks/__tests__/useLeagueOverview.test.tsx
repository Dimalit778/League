import { renderHook } from '@testing-library/react-native';
import { useLeagueOverview } from '@/features/league-overview/hooks/useLeagueOverview';

jest.mock('@/store/MemberStore', () => ({
  usePrimaryMember: () => ({
    memberId: 'm1',
    leagueId: 'l1',
    competitionId: 39,
    nickname: 'tester',
    avatarUrl: 'a.png',
  }),
}));

jest.mock('@/features/leagues/hooks/useLeagues', () => ({
  useGetLeagueAndMembers: () => ({
    data: {
      name: 'My League',
      competition: { logo: 'logo.png', flag: 'flag.png' },
      league_members: [{ id: '1' }, { id: '2' }, { id: '3' }],
    },
    isLoading: false,
  }),
}));

jest.mock('@/features/memberStats/hooks/useMemberStats', () => ({
  useMemberStats: () => ({
    data: { totalPoints: 42, position: 3 },
    isLoading: false,
  }),
}));

jest.mock('@/features/matches/hooks/useMatches', () => ({
  useGetTodayMatches: () => ({ data: [], isLoading: false }),
}));

describe('useLeagueOverview', () => {
  it('assembles the header slice from queries + store', () => {
    const { result } = renderHook(() => useLeagueOverview());
    const { header } = result.current;
    expect(header.leagueName).toBe('My League');
    expect(header.logoUrl).toBe('logo.png');
    expect(header.flagUrl).toBe('flag.png');
    expect(header.membersCount).toBe(3);
    expect(header.rank).toBe(3);
    expect(header.points).toBe(42);
    expect(header.nickname).toBe('tester');
    expect(header.avatarUrl).toBe('a.png');
  });

  it('returns mapped (empty) upcoming matches and combined loading', () => {
    const { result } = renderHook(() => useLeagueOverview());
    expect(result.current.upcomingMatches).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});
