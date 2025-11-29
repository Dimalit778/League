import { Database } from '@/types/database.types';
import { createClient } from '@supabase/supabase-js';
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
const MMKVStorage = {
  getItem: (key: string): Promise<string | null> => {
    try {
      return Promise.resolve(mmkvAdapter.getItem(key));
    } catch (error) {
      console.warn('Storage getItem error:', error);
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string): Promise<void> => {
    try {
      mmkvAdapter.setItem(key, value);
      return Promise.resolve();
    } catch (error) {
      console.warn('Storage setItem error:', error);
      return Promise.resolve();
    }
  },
  removeItem: (key: string): Promise<void> => {
    try {
      mmkvAdapter.removeItem(key);
      return Promise.resolve();
    } catch (error) {
      console.warn('Storage removeItem error:', error);
      return Promise.resolve();
    }
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: MMKVStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
