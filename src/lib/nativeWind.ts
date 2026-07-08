import { clsx, type ClassValue } from 'clsx';
import { vars } from 'nativewind';
import { twMerge } from 'tailwind-merge';

export type ThemeTokens = {
  colors: {
    primary: string;     // צבע המותג המוביל (כתום ספורטיבי)
    onPrimary: string;
    secondary: string;
    onSecondary: string;
    background: string;  // רקע המסך הראשי
    surface: string;     // רקע של כרטיסי משחקים, טבלאות ותפריטים
    border: string;      // קווי הפרדה עדינים
    text: string;        // טקסט ראשי קריא
    muted: string;       // טקסט משני (שעות, תאריכים, יחסים)
    error: string;       // ניחוש שגוי / שגיאה
    success: string;     // ניחוש נכון / הצלחה
  };
  fonts: {
    teko: string;
    tekoBold: string;
  };
};

export const light: ThemeTokens = {
  colors: {
    primary: '#F97316',
    onPrimary: '#FFFFFF',

    secondary: '#3B82F6',
    onSecondary: '#FFFFFF',

    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E2E8F0',

    text: '#0F172A',
    muted: '#64748B',

    error: '#EF4444',
    success: '#22C55E',
  },
  fonts: {
    teko: 'Teko_400Regular',
    tekoBold: 'Teko_700Bold',
  },
};

export const dark: ThemeTokens = {
  colors: {
    primary: '#EA580C',
    onPrimary: '#FFFFFF',

    secondary: '#38BDF8',
    onSecondary: '#0F111A',

    background: '#0F111A',
    surface: '#1E2230',
    border: '#2E3344',

    text: '#F8FAFC',
    muted: '#94A3B8',

    error: '#F87171',
    success: '#4ADE80',
  },
  fonts: {
    teko: 'Teko_400Regular',
    tekoBold: 'Teko_700Bold',
  },
};

export const withOpacity = (hex: string, opacity: number) => {
  const clean = hex.replace('#', '');

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
const toNativeWindVars = (tokens: ThemeTokens) => ({
  '--color-primary': tokens.colors.primary,
  '--color-secondary': tokens.colors.secondary,
  '--color-background': tokens.colors.background,
  '--color-surface': tokens.colors.surface,
  '--color-border': tokens.colors.border,
  '--color-text': tokens.colors.text,
  '--color-on-primary': tokens.colors.onPrimary,
  '--color-on-secondary': tokens.colors.onSecondary,
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


// export type ThemeTokens = {
//   colors: {
//     primary: string;
//     secondary: string;
//     background: string;
//     surface: string;
//     border: string;
//     text: string;
//     bgDark: string;
//     muted: string;
//     error: string;
//     success: string;
//     bgMaterial: string;
//   };
//   fonts: {
//     body: string;
//     bodyBold: string;
//     heading: string;
//     headingBold: string;
//   };
// };

// const light: ThemeTokens = {
//   colors: {
//     primary: '#f97316',
//     secondary: '#3b82f6',
//     background: '#e2e8f0',
//     surface: '#cbd5e1',
//     border: '#94a3b8',
//     text: '#0f172a',
//     muted: '#64748b',
//     error: '#ef4444',
//     success: '#22c55e',
//     bgMaterial: '#f111a',
//     bgDark: '#0b1120',
//   },
//   fonts: {
//     body: 'Nunito_400Regular',
//     bodyBold: 'Nunito_700Bold',
//     heading: 'Teko-Regular',
//     headingBold: 'Teko-Bold',
//   },
// };

// const dark: ThemeTokens = {
//   colors: {
//     primary: '#fb923c',
//     bgMaterial: '#f111a',
//     bgDark:'#121214',
//     secondary: '#4285F4',
//     background: '#0b1120',
//     surface: '#1e293b',
//     border: '#334155',
//     text: '#f1f5f9',
//     muted: '#94a3b8',
//     error: '#f87171',
//     success: '#4ade80',
//   },
//   fonts: {
//     body: 'Nunito_400Regular',
//     bodyBold: 'Nunito_700Bold',
//     heading: 'Teko-Regular',
//     headingBold: 'Teko-Bold',
//   },
// };
