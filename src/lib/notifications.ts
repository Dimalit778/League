import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const MATCH_REMINDERS_CHANNEL_ID = 'match-reminders';

export type NotificationPermissionStatus = 'loading' | 'granted' | 'denied' | 'undetermined' | 'unavailable';

export type NotificationPermissionSnapshot = {
  status: NotificationPermissionStatus;
  canAskAgain: boolean;
};

export const INITIAL_NOTIFICATION_PERMISSION: NotificationPermissionSnapshot = {
  status: Platform.OS === 'web' ? 'unavailable' : 'loading',
  canAskAgain: false,
};

export const setupAndroidNotificationChannel = async () => {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(MATCH_REMINDERS_CHANNEL_ID, {
    name: 'Match reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
  });
};

const toPermissionSnapshot = (
  permission: Awaited<ReturnType<typeof Notifications.getPermissionsAsync>>,
): NotificationPermissionSnapshot => {
  const iosStatus = permission.ios?.status;
  const isAllowed =
    permission.granted ||
    iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL ||
    iosStatus === Notifications.IosAuthorizationStatus.EPHEMERAL;

  if (isAllowed) return { status: 'granted', canAskAgain: permission.canAskAgain };
  if (permission.status === Notifications.PermissionStatus.UNDETERMINED) {
    return { status: 'undetermined', canAskAgain: permission.canAskAgain };
  }
  return { status: 'denied', canAskAgain: permission.canAskAgain };
};

// Read-only: this never displays the system permission prompt.
export const getNotificationPermissionSnapshot = async (): Promise<NotificationPermissionSnapshot> => {
  if (Platform.OS === 'web') return { status: 'unavailable', canAskAgain: false };
  return toPermissionSnapshot(await Notifications.getPermissionsAsync());
};

// Call only after the user accepts the in-app explanation.
export const requestNotificationPermission = async (): Promise<NotificationPermissionSnapshot> => {
  if (Platform.OS === 'web') return { status: 'unavailable', canAskAgain: false };
  return toPermissionSnapshot(await Notifications.requestPermissionsAsync());
};

export const hasNotificationPermission = async (): Promise<boolean> =>
  (await getNotificationPermissionSnapshot()).status === 'granted';
