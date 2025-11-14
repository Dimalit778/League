import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SupportedLanguage = 'en' | 'he';
interface LanguageState {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  toggleLanguage: () => void;
  initializeLanguage: () => Promise<void>;
}
const STORAGE_KEY = 'language-storage';

// Create MMKV storage instance
const storage = createMMKV({ id: STORAGE_KEY });

// Create custom storage adapter for MMKV
const mmkvStorage = {
  setItem: (name: string, value: string) => {
    return storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return storage.remove(name);
  },
};
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
      toggleLanguage: () => {
        const nextLanguage = get().language === 'en' ? 'he' : 'en';
        set({ language: nextLanguage });
      },
      initializeLanguage: async () => {
        try {
          const stored = mmkvStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            const savedLanguage = parsed.state?.language as SupportedLanguage | undefined;
            if (savedLanguage) {
              set({ language: savedLanguage });
            }
          }
        } catch (error) {
          console.warn('Failed to initialize language preference:', error);
          set({ language: 'en' });
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => mmkvStorage),
      skipHydration: false,
    }
  )
);
