import { supabase } from '@/lib/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import { deleteUser } from '../usersApi';

const getSessionMock = supabase.auth.getSession as jest.Mock;
const invokeMock = supabase.functions.invoke as jest.Mock;
const appleSignInMock = AppleAuthentication.signInAsync as jest.Mock;

const sessionFor = (provider: 'email' | 'apple') => ({
  data: {
    session: {
      user: {
        id: 'user-1',
        identities: [{ provider }],
        app_metadata: { provider, providers: [provider] },
      },
    },
  },
  error: null,
});

describe('usersApi.deleteUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    invokeMock.mockResolvedValue({ data: { success: true }, error: null });
  });

  it('deletes a non-Apple account without Apple reauthentication', async () => {
    getSessionMock.mockResolvedValue(sessionFor('email'));

    await deleteUser();

    expect(appleSignInMock).not.toHaveBeenCalled();
    expect(invokeMock).toHaveBeenCalledWith('delete-account', {
      body: { appleAuthorizationCode: null },
    });
  });

  it('reauthenticates and forwards a fresh authorization code for an Apple account', async () => {
    getSessionMock.mockResolvedValue(sessionFor('apple'));
    appleSignInMock.mockResolvedValue({ authorizationCode: 'fresh-apple-code' });

    await deleteUser();

    expect(appleSignInMock).toHaveBeenCalledWith({ requestedScopes: [] });
    expect(invokeMock).toHaveBeenCalledWith('delete-account', {
      body: { appleAuthorizationCode: 'fresh-apple-code' },
    });
  });

  it('does not delete an Apple account when no authorization code is returned', async () => {
    getSessionMock.mockResolvedValue(sessionFor('apple'));
    appleSignInMock.mockResolvedValue({ authorizationCode: null });

    await expect(deleteUser()).rejects.toThrow('authorization code');
    expect(invokeMock).not.toHaveBeenCalled();
  });
});
