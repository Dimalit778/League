import { createMMKV, type MMKV } from 'react-native-mmkv';

// App-level storage: theme, language, and other app-wide settings
// These persist across user sessions
export const appStorage = createMMKV({ id: 'app-storage' });

// User-specific storage: auth state, member data
export const userStorage = createMMKV({ id: 'user-storage' });

// Auth storage: Supabase session storage (kept separate for Supabase client)
export const authStorage = createMMKV({ id: 'auth-storage' });

// Zustand-compatible storage adapter from an MMKV instance

export function createMMKVStorageAdapter(storage: MMKV) {
  return {
    setItem: (name: string, value: string) => {
      storage.set(name, value);
    },
    getItem: (name: string) => {
      const value = storage.getString(name);
      return value ?? null;
    },
    removeItem: (name: string) => {
      storage.remove(name);
    },
  };
}
