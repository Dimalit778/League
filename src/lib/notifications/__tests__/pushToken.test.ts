import * as Notifications from 'expo-notifications';
import { supabase } from '@/lib/supabase';
import { registerPushToken, clearPushToken } from '../pushToken';

jest.mock('expo-notifications', () => ({
  getExpoPushTokenAsync: jest.fn(),
}));
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { eas: { projectId: 'test-project-id' } } } },
}));

const mockGetUser = supabase.auth.getUser as jest.Mock;

describe('pushToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
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
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const token = await registerPushToken();
    expect(token).toBeNull();
  });
});
