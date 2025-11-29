import { appStorage, createMMKVStorageAdapter } from '@/lib/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SupportedLanguage = 'en' | 'he';
interface LanguageState {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  toggleLanguage: () => void;
  initializeLanguage: () => Promise<void>;
}

const mmkvStorage = createMMKVStorageAdapter(appStorage);

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
          const stored = mmkvStorage.getItem('language');
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
      name: 'language-storage',
      storage: createJSONStorage(() => mmkvStorage),
      skipHydration: false,
    }
  )
);
