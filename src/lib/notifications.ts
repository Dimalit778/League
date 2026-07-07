import { appStorage } from '@/lib/storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const PERMISSION_REQUESTED_KEY = 'notifications:permission-requested';
export const MATCH_REMINDERS_CHANNEL_ID = 'match-reminders';

export const setupAndroidNotificationChannel = async () => {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(MATCH_REMINDERS_CHANNEL_ID, {
    name: 'Match reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
  });
};

// Ask for notification permission at most once (first logged-in open).
// Returns whether notifications are currently allowed.
export const ensureNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const alreadyRequested = appStorage.getString(PERMISSION_REQUESTED_KEY) === 'true';
  if (alreadyRequested || !current.canAskAgain) return false;

  const result = await Notifications.requestPermissionsAsync();
  // Only remember the ask after the request actually completed, so a failed
  // request can't suppress the prompt forever.
  appStorage.set(PERMISSION_REQUESTED_KEY, 'true');
  return result.granted;
};

// Whether notifications are allowed without prompting the user.
export const hasNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  return current.granted;
};
