import { clsx, type ClassValue } from 'clsx';
import { vars } from 'nativewind';
import { twMerge } from 'tailwind-merge';

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
    teko: string;
    tekoBold: string;
    nunito: string;
    nunitoBold: string;
    nunitoBlack: string;
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
    tekoBold: 'Teko-Bold',
    teko: 'Teko-Regular',
    nunito: 'Nunito_400Regular',
    nunitoBold: 'Nunito_700Bold',
    nunitoBlack: 'Nunito_900Black',
  },
  sizes: {
    h1: '42px',
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
    teko: 'Teko-Regular',
    tekoBold: 'Teko-Bold',
    nunito: 'Nunito_400Regular',
    nunitoBold: 'Nunito_700Bold',
    nunitoBlack: 'Nunito_900Black',
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
  '--font-size-h1': tokens.sizes.h1,
  '--font-nunito': tokens.fonts.nunito,
  '--font-nunito-bold': tokens.fonts.nunitoBold,
  '--font-nunito-black': tokens.fonts.nunitoBlack,
  '--font-teko': tokens.fonts.teko,
  '--font-teko-bold': tokens.fonts.tekoBold,
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
