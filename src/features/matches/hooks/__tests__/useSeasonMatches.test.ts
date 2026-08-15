import { KEYS } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { useSeasonMatches } from '../useSeasonMatches';

const mockSeasonId = { current: 2502 as number | null };
jest.mock('@/store/PrimaryLeagueStore', () => ({
  usePrimaryLeagueStore: (selector: (state: { seasonId: number | null }) => unknown) =>
    selector({ seasonId: mockSeasonId.current }),
}));

describe('useSeasonMatches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSeasonId.current = 2502;
  });

  it('runs disabled when ids are missing', () => {
    renderHook(() => useSeasonMatches({ competitionId: null, memberId: null }));
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false, queryFn: undefined }),
    );
  });

  it('runs disabled when the season is missing', () => {
    mockSeasonId.current = null;
    renderHook(() => useSeasonMatches({ competitionId: 1, memberId: 'm1' }));
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false, queryFn: undefined }),
    );
  });

  it('queries the season key when ids are present', () => {
    renderHook(() => useSeasonMatches({ competitionId: 1, memberId: 'm1' }));
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: KEYS.matches.season(1, 2502, 'm1'),
        queryFn: expect.any(Function),
        enabled: true,
        refetchInterval: expect.any(Function),
        refetchOnMount: 'always',
        refetchOnWindowFocus: 'always',
      }),
    );
  });
});
