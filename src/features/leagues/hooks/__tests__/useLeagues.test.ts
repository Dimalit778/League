import { KEYS } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leagueActionsApi } from '../../api/leagueActionsApi';
import { leagueApi } from '../../api/leagueApi';
import {
  useCreateLeague,
  useDeleteLeague,
  useFindLeagueByJoinCode,
  useGetCompetitionLeaderboard,
  useUpdatePrimaryLeague,
} from '../useLeagues';

jest.mock('@/store/AuthStore', () => ({
  useAuthStore: (selector: any) => selector({ user: { id: 'u1' } }),
}));

const mockInitializePrimaryLeague = jest.fn().mockResolvedValue(undefined);

jest.mock('@/store/PrimaryLeagueStore', () => ({
  usePrimaryLeagueStore: Object.assign(
    (selector: any) =>
      selector({
        clearPrimaryLeague: jest.fn(),
        initializePrimaryLeague: mockInitializePrimaryLeague,
      }),
    {
      getState: () => ({
        clearPrimaryLeague: jest.fn(),
        initializePrimaryLeague: mockInitializePrimaryLeague,
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
    getCompetitionLeaderboard: jest.fn(),
  },
}));

jest.mock('../../api/leagueActionsApi', () => ({
  leagueActionsApi: {
    createLeague: jest.fn().mockResolvedValue('new-league-id'),
    deleteLeague: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
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

  it('invalidates leagues summary after creating a league', async () => {
    let mutationConfig: any;
    jest.mocked(useMutation).mockImplementationOnce((config: any) => {
      mutationConfig = config;
      return { mutate: jest.fn(), mutateAsync: jest.fn(), isPending: false } as any;
    });

    const queryClient = { invalidateQueries: jest.fn() };
    jest.mocked(useQueryClient).mockReturnValueOnce(queryClient as any);

    useCreateLeague();

    await mutationConfig.onSuccess('new-league-id');

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: KEYS.users.leagues('u1') });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: KEYS.users.leaguesSummary('u1'),
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: KEYS.members.primaryLeague('u1'),
    });
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
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: KEYS.members.primaryLeague('u1') });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: KEYS.users.leagues('u1') });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: KEYS.users.leaguesSummary('u1') });
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
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: KEYS.users.leaguesSummary('u1') });
    expect(queryClient.removeQueries).toHaveBeenCalledWith({ queryKey: KEYS.leagues.detail('l1') });
    expect(queryClient.removeQueries).toHaveBeenCalledWith({ queryKey: KEYS.leagues.members('l1') });
    expect(queryClient.removeQueries).toHaveBeenCalledWith({ queryKey: KEYS.leagues.leaderboard('l1') });
  });

  it('queries the competition leaderboard with the right key', () => {
    useGetCompetitionLeaderboard(2021);

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: KEYS.competitions.leaderboard(2021),
        queryFn: expect.any(Function),
      }),
    );
  });

  it('disables the competition leaderboard query when enabled is false', () => {
    useGetCompetitionLeaderboard(2021, false);

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: KEYS.competitions.leaderboard(2021),
        enabled: false,
      }),
    );
  });
});
