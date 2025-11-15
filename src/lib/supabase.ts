import { Database } from '@/types/database.types';
import { createClient } from '@supabase/supabase-js';
import { createMMKV } from 'react-native-mmkv';

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

const authStorage = createMMKV({ id: 'supabase-auth' });

// Create custom storage adapter compatible with Supabase's expected interface
const supabaseStorage = {
  getItem: (key: string): Promise<string | null> => {
    return Promise.resolve(authStorage.getString(key) ?? null);
  },
  setItem: (key: string, value: string): Promise<void> => {
    authStorage.set(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    authStorage.remove(key);
    return Promise.resolve();
  },
};

// Create a single instance of the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: supabaseStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
