import type { QueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { clearPushToken } from '@/lib/notifications/pushToken';
import { signOut } from '../authApi';

jest.mock('@/lib/notifications/pushToken', () => ({
  clearPushToken: jest.fn(() => Promise.resolve()),
}));

const createQueryClient = () => ({ clear: jest.fn() }) as unknown as QueryClient;

describe('authApi.signOut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.signOut as jest.Mock).mockResolvedValue(undefined);
  });

  it('clears the push token before revoking the Supabase session', async () => {
    const queryClient = createQueryClient();

    const result = await signOut(queryClient);

    expect(result).toEqual({ success: true });
    expect(clearPushToken).toHaveBeenCalledTimes(1);
    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);

    // clearPushToken must run BEFORE supabase.auth.signOut(): once the
    // session is revoked, RLS (auth.uid() = id) blocks the token update.
    const clearPushTokenOrder = (clearPushToken as jest.Mock).mock.invocationCallOrder[0];
    const signOutOrder = (supabase.auth.signOut as jest.Mock).mock.invocationCallOrder[0];
    expect(clearPushTokenOrder).toBeLessThan(signOutOrder);
  });

  it('still signs out even if clearing the push token throws', async () => {
    (clearPushToken as jest.Mock).mockRejectedValueOnce(new Error('RLS denied'));
    const queryClient = createQueryClient();

    const result = await signOut(queryClient);

    expect(result).toEqual({ success: true });
    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
  });
});
