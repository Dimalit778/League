import { Platform } from 'react-native';

/* eslint-disable @typescript-eslint/no-require-imports */

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


      const storage = createMMKV({ id: 'auth-storage' });
      storage.recrypt(key);
      return storage;
    } catch (error) {
      console.error('Failed to open encrypted auth storage:', error);

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

export { appStorage, authStorage, userStorage };

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
