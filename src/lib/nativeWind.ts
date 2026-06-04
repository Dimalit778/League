import { clsx, type ClassValue } from 'clsx';
import { vars } from 'nativewind';
import { twMerge } from 'tailwind-merge';

export type ThemeTokens = {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    border: string;
    text: string;
    muted: string;
    error: string;
    success: string;
  };
  fonts: {
    body: string;
    bodyBold: string;
    heading: string;
    headingBold: string;
  };
};

const light: ThemeTokens = {
  colors: {
    primary: '#f97316',
    secondary: '#3b82f6',
    background: '#e2e8f0',
    surface: '#cbd5e1',
    border: '#94a3b8',
    text: '#0f172a',
    muted: '#64748b',
    error: '#ef4444',
    success: '#22c55e',
  },
  fonts: {
    body: 'Nunito_400Regular',
    bodyBold: 'Nunito_700Bold',
    heading: 'Teko-Regular',
    headingBold: 'Teko-Bold',
  },
};

const dark: ThemeTokens = {
  colors: {
    primary: '#fb923c',
    secondary: '#4285F4',
    background: '#0b1120',
    surface: '#1e293b',
    border: '#334155',
    text: '#f1f5f9',
    muted: '#94a3b8',
    error: '#f87171',
    success: '#4ade80',
  },
  fonts: {
    body: 'Nunito_400Regular',
    bodyBold: 'Nunito_700Bold',
    heading: 'Teko-Regular',
    headingBold: 'Teko-Bold',
  },
};

const toNativeWindVars = (tokens: ThemeTokens) => ({
  '--color-primary': tokens.colors.primary,
  '--color-secondary': tokens.colors.secondary,
  '--color-background': tokens.colors.background,
  '--color-surface': tokens.colors.surface,
  '--color-border': tokens.colors.border,
  '--color-text': tokens.colors.text,
  '--color-text-muted': tokens.colors.muted,
  '--color-error': tokens.colors.error,
  '--color-success': tokens.colors.success,
});

export const themeTokens = {
  light,
  dark,
} as const;

export type ThemeName = keyof typeof themeTokens;

export const themes = {
  light: vars(toNativeWindVars(light)),
  dark: vars(toNativeWindVars(dark)),
};

export const getThemeColor = (theme: ThemeName, color: keyof ThemeTokens['colors']) => themeTokens[theme].colors[color];

export const getThemeTokens = (theme: ThemeName) => themeTokens[theme];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
