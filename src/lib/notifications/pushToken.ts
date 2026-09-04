import { supabase } from '@/lib/supabase';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const getProjectId = (): string | undefined =>
  (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;

const getAuthenticatedUserId = async (): Promise<string | null> => {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
};

// Resolve the device's Expo push token and persist it on the user's row.
// Returns the token, or null on web / signed-out / failure.
export const registerPushToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') return null;
  const sessionId = await getAuthenticatedUserId();
  if (!sessionId) return null;

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: getProjectId() });
    if (!token) return null;

    const { error } = await supabase.from('users').update({ notification_token: token }).eq('id', sessionId);
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
  const sessionId = await getAuthenticatedUserId();
  if (!sessionId) return;
  const { error } = await supabase.from('users').update({ notification_token: null }).eq('id', sessionId);
  if (error) console.warn('[push] failed to clear token:', error.message);
};
