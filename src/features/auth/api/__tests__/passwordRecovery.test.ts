import { supabase } from '@/lib/supabase';
import { createPasswordRecoveryClient } from '@/lib/passwordRecoveryClient';
import { updatePasswordWithRecoveryTokens } from '../authApi';

jest.mock('@/lib/passwordRecoveryClient', () => ({ createPasswordRecoveryClient: jest.fn() }));

describe('password recovery session isolation', () => {
  const recoveryAuth = {
    setSession: jest.fn(), updateUser: jest.fn(), signOut: jest.fn(),
  };
  const tokens = { accessToken: 'recovery-access', refreshToken: 'recovery-refresh' };
  beforeEach(() => {
    jest.clearAllMocks();
    supabase.auth.setSession = jest.fn();
    recoveryAuth.setSession.mockResolvedValue({ error: null });
    recoveryAuth.updateUser.mockResolvedValue({ error: null });
    recoveryAuth.signOut.mockResolvedValue({ error: null });
    (createPasswordRecoveryClient as jest.Mock).mockReturnValue({ auth: recoveryAuth });
  });

  it('updates the password without signing the main app in or out', async () => {
    await expect(updatePasswordWithRecoveryTokens('changed-password123', tokens)).resolves.toEqual({ success: true });
    expect(recoveryAuth.setSession).toHaveBeenCalledWith({ access_token: tokens.accessToken, refresh_token: tokens.refreshToken });
    expect(recoveryAuth.updateUser).toHaveBeenCalledWith({ password: 'changed-password123' });
    expect(recoveryAuth.signOut).toHaveBeenCalledTimes(1);
    expect(supabase.auth.setSession).not.toHaveBeenCalled();
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });

  it('cleans the temporary session when password update fails', async () => {
    recoveryAuth.updateUser.mockResolvedValue({ error: new Error('Password rejected') });
    const result = await updatePasswordWithRecoveryTokens('changed-password123', tokens);
    expect(result.success).toBe(false);
    expect(recoveryAuth.signOut).toHaveBeenCalledTimes(1);
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });

  it('never updates a password if the recovery token is rejected', async () => {
    recoveryAuth.setSession.mockResolvedValue({ error: new Error('Invalid token') });
    expect((await updatePasswordWithRecoveryTokens('changed-password123', tokens)).success).toBe(false);
    expect(recoveryAuth.updateUser).not.toHaveBeenCalled();
  });
});
