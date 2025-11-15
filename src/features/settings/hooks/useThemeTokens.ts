import { getThemeTokens, ThemeName } from '@/lib/nativewind/themes';
import { useThemeStore } from '@/store/ThemeStore';

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
