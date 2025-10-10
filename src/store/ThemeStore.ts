import { ThemeName, getThemeTokens } from '@/lib/nativewind/themes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ThemeState {
  theme: ThemeName;
  isDark: boolean;
  tokens: ReturnType<typeof getThemeTokens>;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
  initializeTheme: () => Promise<void>;
  getColor: (
    colorName: keyof ReturnType<typeof getThemeTokens>['colors']
  ) => string;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark' as ThemeName,

      get tokens() {
        return getThemeTokens(get().theme);
      },

      get isDark() {
        return get().theme === 'dark';
      },

      getColor: (colorName) => {
        return get().tokens.colors[colorName];
      },

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
        try {
          // For development mode, handle potential SSR errors
          try {
            const savedData = await AsyncStorage.getItem('theme-storage');

            if (savedData) {
              const parsed = JSON.parse(savedData);
              const themeToUse = parsed.state?.theme || 'dark';
              colorScheme.set(themeToUse);
              set({ theme: themeToUse as ThemeName });
            } else {
              const defaultTheme: ThemeName = 'dark';
              colorScheme.set(defaultTheme);
              set({ theme: defaultTheme });
            }
          } catch (storageError) {
            const defaultTheme: ThemeName = 'dark';
            colorScheme.set(defaultTheme);
            set({ theme: defaultTheme });
          }
        } catch (error) {
          console.error('Failed to initialize theme:', error);
          const defaultTheme: ThemeName = 'dark';
          colorScheme.set(defaultTheme);
          set({ theme: defaultTheme });
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      skipHydration: false,
    }
  )
);
