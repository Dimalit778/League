import { ThemeName, getThemeTokens } from '@/lib/nativewind/themes';
import { colorScheme } from 'nativewind';
import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Create MMKV storage instance
const storage = createMMKV({ id: 'theme-storage' });

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

interface ThemeState {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
  initializeTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark' as ThemeName,

      setTheme: (theme: ThemeName) => {
        colorScheme.set(theme);
        set({ theme });
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      initializeTheme: async () => {
        // Sync nativewind colorScheme with hydrated theme
        const currentTheme = get().theme;
        colorScheme.set(currentTheme);
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => mmkvStorage),
      skipHydration: false,
    }
  )
);

// Selectors - use these in components for derived state
export const selectIsDark = (state: ThemeState) => state.theme === 'dark';
export const selectTokens = (state: ThemeState) => getThemeTokens(state.theme);
export const selectColor = (colorName: keyof ReturnType<typeof getThemeTokens>['colors']) => (state: ThemeState) =>
  getThemeTokens(state.theme).colors[colorName];
