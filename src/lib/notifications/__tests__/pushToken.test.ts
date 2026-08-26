import * as Notifications from 'expo-notifications';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/AuthStore';
import { registerPushToken, clearPushToken } from '../pushToken';

jest.mock('expo-notifications', () => ({
  getExpoPushTokenAsync: jest.fn(),
}));
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { eas: { projectId: 'test-project-id' } } } },
}));

describe('pushToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: { id: 'user-1' } as any, isAuthenticated: true });
  });

  it('registerPushToken writes the token to users.notification_token', async () => {
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'ExponentPushToken[x]' });
    const eq = jest.fn(() => Promise.resolve({ error: null }));
    const update = jest.fn(() => ({ eq }));
    (supabase.from as jest.Mock).mockReturnValue({ update });

    const token = await registerPushToken();

    expect(token).toBe('ExponentPushToken[x]');
    expect(supabase.from).toHaveBeenCalledWith('users');
    expect(update).toHaveBeenCalledWith({ notification_token: 'ExponentPushToken[x]' });
    expect(eq).toHaveBeenCalledWith('id', 'user-1');
  });

  it('clearPushToken nulls the token for the current user', async () => {
    const eq = jest.fn(() => Promise.resolve({ error: null }));
    const update = jest.fn(() => ({ eq }));
    (supabase.from as jest.Mock).mockReturnValue({ update });

    await clearPushToken();

    expect(update).toHaveBeenCalledWith({ notification_token: null });
    expect(eq).toHaveBeenCalledWith('id', 'user-1');
  });

  it('registerPushToken returns null when there is no user', async () => {
    useAuthStore.setState({ user: null as any, isAuthenticated: false });
    const token = await registerPushToken();
    expect(token).toBeNull();
  });
});
