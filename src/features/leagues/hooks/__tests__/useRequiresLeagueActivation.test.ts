import { renderHook } from '@testing-library/react-native';
import { MyLeaguesResponse } from '../../types';
import { useMyLeagues } from '../useLeagues';
import { useRequiresLeagueActivation } from '../useRequiresLeagueActivation';

jest.mock('../useLeagues', () => ({
  useMyLeagues: jest.fn(),
}));

jest.mock('@/hooks/useSubscriptionLimits', () => ({
  useSubscriptionLimits: jest.fn(),
}));

const { useSubscriptionLimits } = jest.requireMock('@/hooks/useSubscriptionLimits');

function makeMyLeagues(leagues: MyLeaguesResponse['leagues']): MyLeaguesResponse {
  return { primaryLeague: null, leagues, inactiveLeagues: [], total: leagues.length };
}

function makeLeague(id: string, active: boolean, isFree: boolean) {
  return {
    id,
    active,
    league: { id: `league-${id}`, competition: { is_free: isFree } },
  } as unknown as MyLeaguesResponse['leagues'][number];
}

describe('useRequiresLeagueActivation', () => {
  it('is false for a PRO user regardless of their leagues', () => {
    jest.mocked(useMyLeagues).mockReturnValue({
      data: makeMyLeagues([makeLeague('a', true, false)]),
    } as any);
    useSubscriptionLimits.mockReturnValue({ isPro: true, maxLeagues: 5 });

    const { result } = renderHook(() => useRequiresLeagueActivation());
    expect(result.current).toBe(false);
  });

  it('is true when active league count exceeds the free plan limit', () => {
    jest.mocked(useMyLeagues).mockReturnValue({
      data: makeMyLeagues([makeLeague('a', true, true), makeLeague('b', true, true), makeLeague('c', true, true)]),
    } as any);
    useSubscriptionLimits.mockReturnValue({ isPro: false, maxLeagues: 2 });

    const { result } = renderHook(() => useRequiresLeagueActivation());
    expect(result.current).toBe(true);
  });

  it('is true when a single active league is PRO-only, even within the count limit', () => {
    jest.mocked(useMyLeagues).mockReturnValue({
      data: makeMyLeagues([makeLeague('a', true, false)]),
    } as any);
    useSubscriptionLimits.mockReturnValue({ isPro: false, maxLeagues: 2 });

    const { result } = renderHook(() => useRequiresLeagueActivation());
    expect(result.current).toBe(true);
  });

  it('is false when a free user is within count and all active leagues are eligible', () => {
    jest.mocked(useMyLeagues).mockReturnValue({
      data: makeMyLeagues([makeLeague('a', true, true)]),
    } as any);
    useSubscriptionLimits.mockReturnValue({ isPro: false, maxLeagues: 2 });

    const { result } = renderHook(() => useRequiresLeagueActivation());
    expect(result.current).toBe(false);
  });
});
