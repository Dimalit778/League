import { clsx, type ClassValue } from 'clsx';
import { vars } from 'nativewind';
import { twMerge } from 'tailwind-merge';
import { radiusValues } from './radius';
import { spacingValues } from './spacing';

export type ThemeColors = {
  primary: string;
  primaryForeground: string;
  primarySoft: string;
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSoft: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  muted: string;
  mutedForeground: string;
  border: string;
  borderStrong: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  error: string;
  errorSoft: string;
  info: string;
  infoSoft: string;
  overlay: string;
  /** @deprecated Use backgroundSecondary. */
  soft: string;
  /** @deprecated Use surfaceSoft. */
  surfaceSecondary: string;
  /** @deprecated Use info for the legacy blue secondary accent. */
  secondary: string;
};

export type ThemeTokens = {
  colors: ThemeColors;
  gradients: {
    hero: readonly [string, string, string];
    premium: readonly [string, string, string];
  };
  fonts: {
    heading: string;
    headingBold: string;
  };
  spacing: typeof spacingValues;
  radius: typeof radiusValues;
};

const lightColors = {
  primary: '#B7791F',
  primaryForeground: '#FFFFFF',
  primarySoft: '#FFF4D6',
  background: '#F8FAFC',
  backgroundSecondary: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceSoft: '#F1F5F9',
  surfaceElevated: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#334155',
  muted: '#64748B',
  mutedForeground: '#94A3B8',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  success: '#16A34A',
  successSoft: '#DCFCE7',
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  error: '#DC2626',
  errorSoft: '#FEE2E2',
  info: '#0284C7',
  infoSoft: '#E0F2FE',
  overlay: 'rgba(15,23,42,0.35)',
} as const;

const darkColors = {
  primary: '#D6A21E',
  primaryForeground: '#111827',
  primarySoft: '#3A3016',
  background: '#071525',
  backgroundSecondary: '#0A1B2D',
  surface: '#0D2033',
  surfaceSoft: '#132A40',
  surfaceElevated: '#17344D',
  text: '#F8FAFC',
  textSecondary: '#D8E1EA',
  muted: '#94A3B8',
  mutedForeground: '#718096',
  border: '#1F3A52',
  borderStrong: '#31536D',
  success: '#22C55E',
  successSoft: '#123722',
  warning: '#F59E0B',
  warningSoft: '#3D2B0D',
  error: '#EF4444',
  errorSoft: '#3D1818',
  info: '#38BDF8',
  infoSoft: '#123246',
  overlay: 'rgba(0,0,0,0.55)',
} as const;

const withCompatibilityAliases = <T extends Omit<ThemeColors, 'soft' | 'surfaceSecondary' | 'secondary'>>(
  colors: T,
): ThemeColors => ({
  ...colors,
  soft: colors.backgroundSecondary,
  surfaceSecondary: colors.surfaceSoft,
  secondary: colors.info,
});

const sharedTokens = {
  fonts: {
    heading: 'Teko_400Regular',
    headingBold: 'Teko_700Bold',
  },
  spacing: spacingValues,
  radius: radiusValues,
} as const;

const light: ThemeTokens = {
  colors: withCompatibilityAliases(lightColors),
  gradients: {
    hero: ['#F8FAFC', '#F1F5F9', '#E2E8F0'],
    premium: ['#FFF9E8', '#FFF4D6', '#F8FAFC'],
  },
  ...sharedTokens,
};

const dark: ThemeTokens = {
  colors: withCompatibilityAliases(darkColors),
  gradients: {
    hero: ['#071A24', '#0A1827', '#0B1120'],
    premium: ['#061525', '#0B1B30', '#0B1120'],
  },
  ...sharedTokens,
};

export const getNativeWindVariables = (tokens: ThemeTokens) => ({
  '--color-primary': tokens.colors.primary,
  '--color-primary-foreground': tokens.colors.primaryForeground,
  '--color-primary-soft': tokens.colors.primarySoft,
  '--color-background': tokens.colors.background,
  '--color-background-secondary': tokens.colors.backgroundSecondary,
  '--color-surface': tokens.colors.surface,
  '--color-surface-soft': tokens.colors.surfaceSoft,
  '--color-surface-elevated': tokens.colors.surfaceElevated,
  '--color-text': tokens.colors.text,
  '--color-text-secondary': tokens.colors.textSecondary,
  '--color-muted': tokens.colors.muted,
  '--color-muted-foreground': tokens.colors.mutedForeground,
  '--color-border': tokens.colors.border,
  '--color-border-strong': tokens.colors.borderStrong,
  '--color-success': tokens.colors.success,
  '--color-success-soft': tokens.colors.successSoft,
  '--color-warning': tokens.colors.warning,
  '--color-warning-soft': tokens.colors.warningSoft,
  '--color-error': tokens.colors.error,
  '--color-error-soft': tokens.colors.errorSoft,
  '--color-info': tokens.colors.info,
  '--color-info-soft': tokens.colors.infoSoft,
  '--color-overlay': tokens.colors.overlay,
  '--color-secondary': tokens.colors.secondary,
});

export const themeTokens = { light, dark } as const;
export type ThemeName = keyof typeof themeTokens;

export const themes = {
  light: vars(getNativeWindVariables(light)),
  dark: vars(getNativeWindVariables(dark)),
};

export const getThemeColor = (theme: ThemeName, color: keyof ThemeColors) => themeTokens[theme].colors[color];
export const getThemeTokens = (theme: ThemeName): ThemeTokens => themeTokens[theme];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
