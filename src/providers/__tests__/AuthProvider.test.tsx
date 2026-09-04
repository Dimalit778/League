import { act, render, waitFor } from '@testing-library/react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/AuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { queryPersister } from '@/lib/queryPersister';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { AuthProvider } from '../AuthProvider';

jest.mock('@/lib/queryPersister', () => ({ queryPersister: { removeClient: jest.fn() } }));

jest.mock('@/features/auth/legalAcceptance', () => ({ recordPendingWebLegalAcceptance: jest.fn().mockResolvedValue(undefined) }));

describe('AuthProvider request ordering', () => {
  const clear = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    (useQueryClient as jest.Mock).mockReturnValue({ clear });
  });
  it('does not reauthenticate from a user fetch that finishes after signout', async () => {
    useAuthStore.setState({ user: null, session: null, isAuthenticated: false, isAuthLoading: true });
    let resolveUser!: (value: unknown) => void;
    const userRequest = new Promise((resolve) => { resolveUser = resolve; });
    const chain = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockReturnValue(userRequest) };
    (supabase.from as jest.Mock).mockReturnValue(chain);
    const session = { user: { id: 'old-user', email_confirmed_at: '2026-08-01', app_metadata: { provider: 'email' } } };
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session } });
    render(<AuthProvider>{null}</AuthProvider>);
    await waitFor(() => expect(chain.single).toHaveBeenCalled());
    const onAuth = (supabase.auth.onAuthStateChange as jest.Mock).mock.calls.at(-1)[0];
    usePrimaryLeagueStore.getState().setPrimaryLeague({ memberId: 'old-member', leagueId: 'old-league', competitionId: 2021, seasonId: 1, nickname: 'Old', avatarUrl: null });
    await act(async () => { onAuth('SIGNED_OUT', null); });
    expect(usePrimaryLeagueStore.getState().leagueId).toBeNull();
    expect(clear).toHaveBeenCalled();
    expect(queryPersister.removeClient).toHaveBeenCalled();
    await act(async () => { resolveUser({ data: { id: 'old-user' }, error: null }); });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
