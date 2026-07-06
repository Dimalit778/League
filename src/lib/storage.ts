import { Platform } from 'react-native';

// Web-compatible storage adapter using localStorage
const createWebStorage = (id: string) => ({
  set: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${id}:${key}`, value);
    }
  },
  getString: (key: string): string | undefined => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`${id}:${key}`) ?? undefined;
    }
    return undefined;
  },
  remove: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${id}:${key}`);
    }
  },
});

// Storage interface that works on both native and web
type StorageInstance = {
  set: (key: string, value: string) => void;
  getString: (key: string) => string | undefined;
  remove: (key: string) => void;
};

let appStorage: StorageInstance;
let userStorage: StorageInstance;
let authStorage: StorageInstance;

if (Platform.OS === 'web') {
  appStorage = createWebStorage('app-storage');
  userStorage = createWebStorage('user-storage');
  authStorage = createWebStorage('auth-storage');
} else {
  const { createMMKV } = require('react-native-mmkv');
  const SecureStore = require('expo-secure-store');
  const Crypto = require('expo-crypto');

  const AUTH_ENCRYPTION_KEY_NAME = 'auth-storage-encryption-key';

  // The auth store holds Supabase refresh/access tokens, so it is encrypted
  // with a random key kept in the device Keychain/Keystore. MMKV crypt keys
  // are limited to 16 bytes, so 16 random bytes are packed into 16 chars of a
  // 64-symbol alphabet (96 bits of entropy).
  const generateEncryptionKey = (): string => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const bytes: Uint8Array = Crypto.getRandomBytes(16);
    return Array.from(bytes, (b: number) => alphabet[b % 64]).join('');
  };

  const createAuthStorage = (): StorageInstance => {
    try {
      const existingKey = SecureStore.getItem(AUTH_ENCRYPTION_KEY_NAME);
      if (existingKey) {
        return createMMKV({ id: 'auth-storage', encryptionKey: existingKey });
      }

      const key = generateEncryptionKey();
      SecureStore.setItem(AUTH_ENCRYPTION_KEY_NAME, key);

      // Existing installs have a plaintext auth store; recrypt it in place so
      // the current session survives the upgrade.
      const storage = createMMKV({ id: 'auth-storage' });
      storage.recrypt(key);
      return storage;
    } catch (error) {
      console.error('Failed to open encrypted auth storage:', error);
      // Fail closed: never write tokens to disk unencrypted. An in-memory
      // store keeps the app usable for this launch; the user re-authenticates
      // on the next one.
      const memory = new Map<string, string>();
      return {
        set: (key, value) => {
          memory.set(key, value);
        },
        getString: (key) => memory.get(key),
        remove: (key) => {
          memory.delete(key);
        },
      };
    }
  };

  appStorage = createMMKV({ id: 'app-storage' });
  userStorage = createMMKV({ id: 'user-storage' });
  authStorage = createAuthStorage();
}

export { appStorage, userStorage, authStorage };

// Zustand-compatible storage adapter
export function createMMKVStorageAdapter(storage: StorageInstance) {
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
