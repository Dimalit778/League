import { getThemeTokens, type ThemeName } from '@/lib/nativeWind';
import { appStorage, createMMKVStorageAdapter } from '@/lib/storage';
import { colorScheme } from 'nativewind';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const mmkvStorage = createMMKVStorageAdapter(appStorage);

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
        if (Platform.OS === 'web') {
          // On web, manually toggle the 'dark' class on document element
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } else {
          // On native, use NativeWind's colorScheme
          colorScheme.set(theme);
        }
        set({ theme });
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      initializeTheme: async () => {
        // Sync theme with platform-specific implementation
        const currentTheme = get().theme;
        if (Platform.OS === 'web') {
          if (currentTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } else {
          colorScheme.set(currentTheme);
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => mmkvStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (Platform.OS === 'web') {
          document.documentElement.classList.toggle('dark', state.theme === 'dark');
        } else {
          colorScheme.set(state.theme);
        }
      },
    },
  ),
);

// Selectors - use these in components for derived state
export const selectIsDark = (state: ThemeState) => state.theme === 'dark';
export const selectTokens = (state: ThemeState) => getThemeTokens(state.theme);
export const selectColor = (colorName: keyof ReturnType<typeof getThemeTokens>['colors']) => (state: ThemeState) =>
  getThemeTokens(state.theme).colors[colorName];
