import { clsx, type ClassValue } from 'clsx';
import { vars } from 'nativewind';
import { twMerge } from 'tailwind-merge';
import { radiusValues } from './radius';
import { spacingValues } from './spacing';

export type ThemeColors = {
  primary: string;
  onPrimary: string;
  background: string;
  surface: string;
  subtle: string;
  text: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  overlay: string;
};

export type ThemeGradients = {
  hero: readonly [string, string, string];
  premium: readonly [string, string, string];
  card: readonly [string, string, string];
};

export type ThemeEffects = {
  cardBorder: string;
  cardHighlight: string;
  cardShadow: string;
  cardGlow: string;
  cardActiveGlow: string;
};

export type ThemeTokens = {
  colors: ThemeColors;
  gradients: ThemeGradients;
  effects: ThemeEffects;

  fonts: {
    heading: string;
    headingBold: string;
  };
  spacing: typeof spacingValues;
  radius: typeof radiusValues;
};

const lightColors = {
  primary: '#7A5800',
  onPrimary: '#FFFFFF',
  background: '#F8F9F7',
  surface: '#FFFFFF',
  subtle: '#F1F5F9',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  success: '#087A35',
  warning: '#92400E',
  error: '#DC2626',
  info: '#0369A1',
  overlay: 'rgba(15,23,42,0.35)',
} as const;

const darkColors = {
  primary: '#D6A21E',
  onPrimary: '#111827',
  background: '#071525',
  surface: '#0D2033',
  subtle: '#132A40',
  text: '#F8FAFC',
  muted: '#94A3B8',
  border: '#1F3A52',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#F87171',
  info: '#38BDF8',
  overlay: 'rgba(0,0,0,0.55)',
} as const;

const lightGradients: ThemeGradients = {
  hero: ['#F8FAFC', '#F1F5F9', '#E2E8F0'],
  premium: ['#FFF9E8', '#FFF4D6', '#F8FAFC'],
  card: ['#F8FAFC', '#F1F5F9', '#E8EEF4'],
};

const darkGradients: ThemeGradients = {
  hero: ['#071A24', '#0A1827', '#0B1120'],
  premium: ['#061525', '#0B1B30', '#0B1120'],
  card: ['#10283C', '#0C2032', '#091A2A'],
};

const lightEffects: ThemeEffects = {
  cardBorder: 'rgba(15, 23, 42, 0.08)',
  cardHighlight: 'rgba(255, 255, 255, 0.8)',
  cardShadow: '#475569',
  cardGlow: 'rgba(122, 88, 0, 0.1)',
  cardActiveGlow: 'rgba(122, 88, 0, 0.1)',
};

const darkEffects: ThemeEffects = {
  cardBorder: 'rgba(120, 155, 185, 0.18)',
  cardHighlight: 'rgba(255, 255, 255, 0.06)',
  cardShadow: '#000000',
  cardGlow: 'rgba(214, 162, 30, 0.22)',
  cardActiveGlow: 'rgba(214, 162, 30, 0.22)',
};

const sharedTokens = {
  fonts: {
    heading: 'Teko_400Regular',
    headingBold: 'Teko_700Bold',
  },
  spacing: spacingValues,
  radius: radiusValues,
} as const;

const light: ThemeTokens = {
  colors: lightColors,
  gradients: lightGradients,
  effects: lightEffects,

  ...sharedTokens,
};
const dark: ThemeTokens = {
  colors: darkColors,
  gradients: darkGradients,
  effects: darkEffects,

  ...sharedTokens,
};

export const getNativeWindVariables = (tokens: ThemeTokens) => ({
  '--color-primary': tokens.colors.primary,
  '--color-on-primary': tokens.colors.onPrimary,
  '--color-background': tokens.colors.background,
  '--color-surface': tokens.colors.surface,
  '--color-subtle': tokens.colors.subtle,
  '--color-text': tokens.colors.text,
  '--color-muted': tokens.colors.muted,
  '--color-border': tokens.colors.border,
  '--color-success': tokens.colors.success,
  '--color-warning': tokens.colors.warning,
  '--color-error': tokens.colors.error,
  '--color-info': tokens.colors.info,
  '--color-overlay': tokens.colors.overlay,
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
