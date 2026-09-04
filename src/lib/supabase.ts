import { Database } from '@/types/database.types';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { authStorage, createMMKVStorageAdapter } from './storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('EXPO_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all variables are set.\n' +
      'See .env.example for reference.'
  );
}

// Convert synchronous MMKV adapter to Promise-based for Supabase
const mmkvAdapter = createMMKVStorageAdapter(authStorage);
const reportStorageError = (operation: string, error: unknown) => {
  if (__DEV__) {
    console.warn(`[auth-storage] ${operation} failed`, error);
    return;
  }
  Sentry.captureException(error, { tags: { subsystem: 'auth-storage', operation } });
};
const MMKVStorage = {
  getItem: (key: string): Promise<string | null> => {
    try {
      return Promise.resolve(mmkvAdapter.getItem(key));
    } catch (error) {
      reportStorageError('read', error);
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string): Promise<void> => {
    try {
      mmkvAdapter.setItem(key, value);
      return Promise.resolve();
    } catch (error) {
      reportStorageError('write', error);
      return Promise.resolve();
    }
  },
  removeItem: (key: string): Promise<void> => {
    try {
      mmkvAdapter.removeItem(key);
      return Promise.resolve();
    } catch (error) {
      reportStorageError('remove', error);
      return Promise.resolve();
    }
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: MMKVStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Web OAuth returns ?code= in the URL; native keeps this off so password-reset
    // deep links are consumed manually instead of racing the auth client.
    detectSessionInUrl: Platform.OS === 'web' &&
      !(typeof window !== 'undefined' && /\/(reset-password|resetPassword)(?:[/?#]|$)/.test(window.location.href)),
  },
});
