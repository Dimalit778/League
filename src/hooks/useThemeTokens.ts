import { useThemeStore } from '@/store/ThemeStore';
import { getThemeTokens, ThemeName } from '@/styles/themes';

export const useThemeTokens = () => {
  const theme = useThemeStore((state) => state.theme as ThemeName);
  const tokens = getThemeTokens(theme);

  return {
    theme,
    colors: tokens.colors,
    fonts: tokens.fonts,
    sizes: tokens.sizes,
  } as const;
};
