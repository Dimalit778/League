import { appStorage, createMMKVStorageAdapter } from '@/lib/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SupportedLanguage = 'en' | 'he';
interface LanguageState {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  toggleLanguage: () => void;
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
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => mmkvStorage),
      skipHydration: false,
    }
  )
);
