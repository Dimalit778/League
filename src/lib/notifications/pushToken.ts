import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/AuthStore';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const getUserId = (): string | null => useAuthStore.getState().user?.id ?? null;

const getProjectId = (): string | undefined =>
  (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;

// Resolve the device's Expo push token and persist it on the user's row.
// Returns the token, or null on web / signed-out / failure.
export const registerPushToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') return null;
  const userId = getUserId();
  if (!userId) return null;

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: getProjectId() });
    if (!token) return null;

    const { error } = await supabase.from('users').update({ notification_token: token }).eq('id', userId);
    if (error) {
      console.warn('[push] failed to store token:', error.message);
      return null;
    }
    return token;
  } catch (error) {
    console.warn('[push] getExpoPushTokenAsync failed:', error);
    return null;
  }
};

// Clear the stored token so the server stops targeting this user.
export const clearPushToken = async (): Promise<void> => {
  const userId = getUserId();
  if (!userId) return;
  const { error } = await supabase.from('users').update({ notification_token: null }).eq('id', userId);
  if (error) console.warn('[push] failed to clear token:', error.message);
};
