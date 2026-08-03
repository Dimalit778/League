import * as Notifications from 'expo-notifications';
import { getNotificationPermissionSnapshot, requestNotificationPermission } from '../notifications';

jest.mock('expo-notifications', () => ({
  AndroidImportance: { DEFAULT: 3 },
  IosAuthorizationStatus: { PROVISIONAL: 3, EPHEMERAL: 4 },
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
  },
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
}));

const permission = (overrides: Record<string, unknown> = {}) => ({
  status: Notifications.PermissionStatus.UNDETERMINED,
  granted: false,
  canAskAgain: true,
  expires: 'never' as const,
  ...overrides,
});

describe('notification permissions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reads an undetermined permission without showing the system prompt', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue(permission());

    await expect(getNotificationPermissionSnapshot()).resolves.toEqual({
      status: 'undetermined',
      canAskAgain: true,
    });
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('reports the real granted status', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue(
      permission({ status: Notifications.PermissionStatus.GRANTED, granted: true, canAskAgain: false }),
    );

    await expect(getNotificationPermissionSnapshot()).resolves.toEqual({
      status: 'granted',
      canAskAgain: false,
    });
  });

  it('requests permission only through the explicit request action', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue(
      permission({ status: Notifications.PermissionStatus.DENIED, canAskAgain: false }),
    );

    await expect(requestNotificationPermission()).resolves.toEqual({
      status: 'denied',
      canAskAgain: false,
    });
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });
});
