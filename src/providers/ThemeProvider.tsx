import { getThemeTokens, ThemeName, themes } from '@/lib/nativewind/nativeWind';
import { useThemeStore } from '@/store/ThemeStore';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider, Theme } from '@react-navigation/native';
import { View } from 'react-native';
function getNavigationTheme(theme: ThemeName): Theme {
  const { colors } = getThemeTokens(theme);
  const base = theme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
    },
  };
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useThemeStore((state) => state.theme);
  return (
    <NavigationThemeProvider value={getNavigationTheme(theme)}>
      <View className="flex-1" style={[themes[theme]]}>
        {children}
      </View>
    </NavigationThemeProvider>
  );
};
