import { vars } from 'nativewind';

type ThemeTokens = {
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
    headlineBold: string;
    headlineLight: string;
    body: string;
    bodyLight: string;
  };
  sizes: {
    h1: string;
  };
};

const light: ThemeTokens = {
  colors: {
    primary: '#f97316',
    secondary: '#3b82f6',
    background: '#ffffff',
    surface: '#f3f4f6',
    border: '#e5e7eb',
    text: '#111827',
    muted: '#6b7280',
    error: '#ef4444',
    success: '#22c55e',
  },
  fonts: {
    headlineBold: 'Teko-Bold',
    headlineLight: 'Teko-Light',
    body: 'Inter-Regular',
    bodyLight: 'Inter-Light',
  },
  sizes: {
    h1: '42px',
  },
};

const dark: ThemeTokens = {
  colors: {
    primary: '#fb923c',
    secondary: '#60a5fa',
    background: '#0f172a',
    surface: '#1e293b',
    border: '#334155',
    text: '#f1f5f9',
    muted: '#94a3b8',
    error: '#f87171',
    success: '#4ade80',
  },
  fonts: {
    headlineBold: 'Teko-Bold',
    headlineLight: 'Teko-Light',
    body: 'Inter-Regular',
    bodyLight: 'Inter-Light',
  },
  sizes: {
    h1: '42px',
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
  '--font-headline-bold': tokens.fonts.headlineBold,
  '--font-headline-light': tokens.fonts.headlineLight,
  '--font-body': tokens.fonts.body,
  '--font-body-light': tokens.fonts.bodyLight,
  '--font-size-h1': tokens.sizes.h1,
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

export const getThemeColor = (
  theme: ThemeName,
  color: keyof ThemeTokens['colors']
) => themeTokens[theme].colors[color];

export const getThemeTokens = (theme: ThemeName) => themeTokens[theme];
