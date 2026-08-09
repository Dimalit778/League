import { act, renderHook } from '@testing-library/react-native';
import { MyLeague } from '../../types';
import { useLeagueActivationResolution } from '../useLeagueActivationResolution';

function makeLeague(id: string, isFree: boolean): MyLeague {
  return {
    id,
    league: {
      id: `league-${id}`,
      competition: { is_free: isFree },
    },
  } as unknown as MyLeague;
}

describe('useLeagueActivationResolution', () => {
  it('does not select a PRO-only league', () => {
    const leagues = [makeLeague('free-1', true), makeLeague('pro-1', false)];

    const { result } = renderHook(() =>
      useLeagueActivationResolution({
        leagues,
        maxLeagues: 2,
        enabled: true,
        updateLeagueActivation: jest.fn(),
        refetch: jest.fn(),
      }),
    );

    act(() => result.current.toggleLeague('pro-1'));

    expect(result.current.selectedMemberIds).toEqual([]);
  });

  it('selects a free league normally', () => {
    const leagues = [makeLeague('free-1', true), makeLeague('pro-1', false)];

    const { result } = renderHook(() =>
      useLeagueActivationResolution({
        leagues,
        maxLeagues: 2,
        enabled: true,
        updateLeagueActivation: jest.fn(),
        refetch: jest.fn(),
      }),
    );

    act(() => result.current.toggleLeague('free-1'));

    expect(result.current.selectedMemberIds).toEqual(['free-1']);
  });

  it('drops a previously selected league that becomes ineligible', () => {
    const { result, rerender } = renderHook(
      ({ leagues: currentLeagues }: { leagues: MyLeague[] }) =>
        useLeagueActivationResolution({
          leagues: currentLeagues,
          maxLeagues: 2,
          enabled: true,
          updateLeagueActivation: jest.fn(),
          refetch: jest.fn(),
        }),
      { initialProps: { leagues: [makeLeague('free-1', true), makeLeague('was-free-1', true)] } },
    );

    act(() => result.current.toggleLeague('was-free-1'));
    expect(result.current.selectedMemberIds).toEqual(['was-free-1']);

    rerender({ leagues: [makeLeague('free-1', true), makeLeague('was-free-1', false)] });

    expect(result.current.selectedMemberIds).toEqual([]);
  });
});
