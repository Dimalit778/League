import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  isDark: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  initializeTheme: () => Promise<void>;
}

// For mobile-only apps, we can use a simpler approach
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',

      get isDark() {
        return get().theme === 'dark';
      },

      setTheme: (theme: 'light' | 'dark') => {
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
              set({ theme: themeToUse });
            } else {
              colorScheme.set('dark');
              set({ theme: 'dark' });
            }
          } catch (storageError) {
            // If AsyncStorage fails (e.g., during development), use default theme
            console.log('Storage access failed, using default theme');
            colorScheme.set('dark');
            set({ theme: 'dark' });
          }
        } catch (error) {
          console.error('Failed to initialize theme:', error);
          colorScheme.set('dark');
          set({ theme: 'dark' });
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Skip hydration in environments where AsyncStorage might fail
      skipHydration: false,
    }
  )
);
