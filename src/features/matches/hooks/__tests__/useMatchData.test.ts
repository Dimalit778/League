import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { useGetMatchData } from '../useMatchData';

jest.mock('@/store/PrimaryLeagueStore', () => ({
  useLeagueId: () => 'league-1',
  usePrimaryLeagueStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      memberId: 'member-1',
      leagueId: 'league-1',
      competitionId: 1,
      seasonId: 2026,
      nickname: 'Player',
      avatarUrl: null,
    }),
}));

jest.mock('@/store/AuthStore', () => ({
  useAuthStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ user: { id: 'user-1' } }),
}));

describe('useGetMatchData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reuses the same select function across hook renders', () => {
    const firstRender = renderHook(() => useGetMatchData(42));
    const firstSelect = jest.mocked(useQuery).mock.calls.at(-1)?.[0].select;
    firstRender.unmount();

    renderHook(() => useGetMatchData(42));
    const secondSelect = jest.mocked(useQuery).mock.calls.at(-1)?.[0].select;

    expect(firstSelect).toBeDefined();
    expect(secondSelect).toBe(firstSelect);
  });
});
