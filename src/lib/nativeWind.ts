import { clsx, type ClassValue } from 'clsx';
import { vars } from 'nativewind';
import { twMerge } from 'tailwind-merge';

export type ThemeTokens = {
  colors: {
    primary: string;
    background: string;
    surface: string;
    surfaceSecondary: string;
    text: string;
    muted: string;
    border: string;
    error: string;
    success: string;
  };
  fonts: {
    heading: string;
    headingBold: string;
  };
};

const light: ThemeTokens = {
  colors: { 
    background: '#F1F5F9',
    primary: '#B7791F',
    surface: '#FFFFFF',
    surfaceSecondary: '#E8EDF4',
    border: '#D5DDE8',
    text: '#0F172A',
    muted: '#64748B',
    error: '#DC2626',
    success: '#16A34A',
  },
  fonts: {
    heading: 'Teko-Regular',
    headingBold: 'Teko-Bold',
  },
};

const dark: ThemeTokens = {
  colors: {
    background: '#0b1120',
primary: '#D6A21E',
    surface: '#111827',
  surfaceSecondary: '#172033',
    border: '#334155',
    text: '#f1f5f9',
    muted: '#94a3b8',
    error: '#F87171',
    success: '#4ADE80',
  },
  fonts: {
    heading: 'Teko-Regular',
    headingBold: 'Teko-Bold',
  },
};

const toNativeWindVars = (tokens: ThemeTokens) => ({
  '--color-primary': tokens.colors.primary,
  '--color-background': tokens.colors.background,
  '--color-surface': tokens.colors.surface,
  '--color-surfaceSecondary': tokens.colors.surfaceSecondary,
  '--color-text': tokens.colors.text,
  '--color-text-muted': tokens.colors.muted,  
  '--color-border': tokens.colors.border,
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




// export type ThemeTokens = {
//   colors: {
//     primary: string;
//     secondary: string;
//     background: string;
//     surface: string;
//     border: string;
//     text: string;
//     muted: string;
//     info: string;
//     error: string;
//     success: string;
//   };
//   fonts: {

//     heading: string;
//     headingBold: string;
//   };
// };

// const light: ThemeTokens = {
//   colors: {
//     primary: '#FFD300',
//     secondary: '#3b82f6',
//     background: '#e2e8f0',
//     surface: '#cbd5e1',
//     border: '#94a3b8',
//     text: '#0f172a',
//     muted: '#64748b',
//     info:'#7d98ff',
//     error: '#ef4444',
//     success: '#22c55e',
  
//   },
//   fonts: {
//     heading: 'Teko-Regular',
//     headingBold: 'Teko-Bold',
//   },
// };

// const dark: ThemeTokens = {
//   colors: {
//     primary: '#FFD300',
//     secondary: '#4285F4',
//     background: '#0b1120',
//     surface: '#1e293b',
//     border: '#334155',
//     text: '#f1f5f9',
//     muted: '#94a3b8',
//     info:'#7d98ff',
//     error: '#f87171',
//     success: '#92db32',
//   },
//   fonts: {
//     heading: 'Teko-Regular',
//     headingBold: 'Teko-Bold',
//   },
// };