import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ThemeState {
  theme: 'light' | 'dark';
  isDark: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  initializeTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      
      // Computed property for convenience
      get isDark() {
        return get().theme === 'dark';
      },

      setTheme: (theme: 'light' | 'dark') => {
        // Update NativeWind immediately
        colorScheme.set(theme);
        
        // Update store
        set({ theme });
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      initializeTheme: async () => {
        try {
          // Get saved theme from persistence
          const savedData = await AsyncStorage.getItem('theme-storage');
          
          let themeToUse: 'light' | 'dark' = 'dark';
          
          if (savedData) {
            const parsed = JSON.parse(savedData);
            themeToUse = parsed.state?.theme || 'dark';
          }
          
          // Apply theme to NativeWind
          colorScheme.set(themeToUse);
          
          // Update store
          set({ theme: themeToUse });
          
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
    }
  )
);
