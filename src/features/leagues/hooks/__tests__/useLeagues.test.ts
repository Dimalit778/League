import { KEYS } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leagueActionsApi } from '../../api/leagueActionsApi';
import { leagueApi } from '../../api/leagueApi';
import { useDeleteLeague, useFindLeagueByJoinCode, useUpdatePrimaryLeague } from '../useLeagues';

jest.mock('@/store/AuthStore', () => ({
  useAuthStore: (selector: any) => selector({ user: { id: 'u1' } }),
}));

jest.mock('@/store/MemberStore', () => ({
  useMemberStore: Object.assign(
    (selector: any) =>
      selector({
        initializeMember: jest.fn(),
      }),
    {
      getState: () => ({
        clearMember: jest.fn(),
      }),
    },
  ),
}));

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'u1' } }),
}));

jest.mock('../../api/leagueApi', () => ({
  leagueApi: {
    findLeagueByJoinCode: jest.fn(),
    updatePrimaryLeague: jest.fn(),
  },
}));

jest.mock('../../api/leagueActionsApi', () => ({
  leagueActionsApi: {
    deleteLeague: jest.fn().mockResolvedValue({ success: true }),
  },
}));

describe('useLeagues hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not query join code lookup before the code is complete', () => {
    useFindLeagueByJoinCode('ABC');

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: KEYS.leagues.byJoinCode('ABC'),
        queryFn: undefined,
      })
    );
  });

  it('queries join code lookup with the normalized complete code', () => {
    useFindLeagueByJoinCode(' abc1234 ');

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: KEYS.leagues.byJoinCode('ABC1234'),
        queryFn: expect.any(Function),
      })
    );
  });

  it('uses the atomic primary-league mutation and targeted invalidation', async () => {
    let mutationConfig: any;
    jest.mocked(useMutation).mockImplementationOnce((config: any) => {
      mutationConfig = config;
      return { mutate: jest.fn(), mutateAsync: jest.fn(), isPending: false } as any;
    });

    const queryClient = { invalidateQueries: jest.fn() };
    jest.mocked(useQueryClient).mockReturnValueOnce(queryClient as any);

    useUpdatePrimaryLeague();

    await mutationConfig.mutationFn({ leagueId: 'l1' });
    await mutationConfig.onSuccess({}, { leagueId: 'l1' });

    expect(leagueApi.updatePrimaryLeague).toHaveBeenCalledWith('l1');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: KEYS.leagues.leaderboard('l1') });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: KEYS.members.primary('u1') });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: KEYS.users.leagues('u1') });
  });

  it('uses the atomic delete mutation and targeted invalidation', async () => {
    let mutationConfig: any;
    jest.mocked(useMutation).mockImplementationOnce((config: any) => {
      mutationConfig = config;
      return { mutate: jest.fn(), mutateAsync: jest.fn(), isPending: false } as any;
    });

    const queryClient = { invalidateQueries: jest.fn(), removeQueries: jest.fn() };
    jest.mocked(useQueryClient).mockReturnValueOnce(queryClient as any);

    useDeleteLeague();

    await mutationConfig.mutationFn({ leagueId: 'l1', ownerId: 'u1' });
    await mutationConfig.onSuccess({}, { leagueId: 'l1', ownerId: 'u1' });

    expect(leagueActionsApi.deleteLeague).toHaveBeenCalledWith('l1');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: KEYS.users.leagues('u1') });
    expect(queryClient.removeQueries).toHaveBeenCalledWith({ queryKey: KEYS.leagues.detail('l1') });
    expect(queryClient.removeQueries).toHaveBeenCalledWith({ queryKey: KEYS.leagues.members('l1') });
    expect(queryClient.removeQueries).toHaveBeenCalledWith({ queryKey: KEYS.leagues.leaderboard('l1') });
  });
});
