import { getThemeTokens, type ThemeName } from "@/lib/nativewind/nativeWind";
import { useThemeStore } from "@/store/ThemeStore";

export const useThemeTokens = () => {
  const theme = useThemeStore((state) => state.theme as ThemeName);
  const tokens = getThemeTokens(theme);

  return {
    theme,
    isDark: theme === "dark",
    colors: tokens.colors,
    gradients: tokens.gradients,
    effects: tokens.effects,
    spacing: tokens.spacing,
    radius: tokens.radius,
  } as const;
};
