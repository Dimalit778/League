import { KEYS } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { useSeasonMatches } from '../useSeasonMatches';

describe('useSeasonMatches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs disabled when ids are missing', () => {
    renderHook(() => useSeasonMatches({ competitionId: null, memberId: null }));
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false, queryFn: undefined }),
    );
  });

  it('queries the season key when ids are present', () => {
    renderHook(() => useSeasonMatches({ competitionId: 1, memberId: 'm1' }));
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: KEYS.matches.season(1, 'm1'),
        queryFn: expect.any(Function),
        enabled: true,
      }),
    );
  });
});
