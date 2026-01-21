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
  appStorage = createMMKV({ id: 'app-storage' });
  userStorage = createMMKV({ id: 'user-storage' });
  authStorage = createMMKV({ id: 'auth-storage' });
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
