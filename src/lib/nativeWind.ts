import { clsx, type ClassValue } from 'clsx';
import { vars } from 'nativewind';
import { twMerge } from 'tailwind-merge';

export type ThemeTokens = {
  colors: {
    primary: string;     // צבע המותג המוביל (כתום ספורטיבי)
    secondary: string;   // צבע משני להדגשות (כחול/תכלת)
    background: string;  // רקע המסך הראשי
    surface: string;     // רקע של כרטיסי משחקים, טבלאות ותפריטים
    border: string;      // קווי הפרדה עדינים
    text: string;        // טקסט ראשי קריא
    muted: string;       // טקסט משני (שעות, תאריכים, יחסים)
    error: string;       // ניחוש שגוי / שגיאה
    success: string;     // ניחוש נכון / הצלחה
  };
  fonts: {
    body: string;
    bodyBold: string;
    heading: string;
    headingBold: string;
  };
};

export const light: ThemeTokens = {
  colors: {
    primary: '#F97316',     // כתום חי ועמוק, בולט על רקע בהיר
    secondary: '#3B82F6',   // כחול הייטק נקי ומקצועי
    background: '#F8FAFC',  // אפור בהיר מאוד, נותן תחושת מרחב ואוויר
    surface: '#FFFFFF',     // כרטיסים לבנים לחלוטין - מייצר הפרדה מושלמת מהרקע
    border: '#E2E8F0',      // קווי הפרדה דקים וכמעט בלתי מורגשים
    text: '#0F172A',        // כחול-כהה לילי (הרבה יותר יוקרתי משחור מוחלט)
    muted: '#64748B',       // אפור ניטרלי לנתונים משניים
    error: '#EF4444',       // אדום פסטלי מעודן למניעת עומס בעין
    success: '#22C55E',     // ירוק דשא נקי לסימון הצלחה
  },
  fonts: {
    body: 'Nunito_400Regular',
    bodyBold: 'Nunito_700Bold',
    heading: 'Teko-Regular', 
    headingBold: 'Teko-Bold',
  },
};

export const dark: ThemeTokens = {
  colors: {
    primary: '#FB923C',     // כתום מעט בהיר יותר כדי שיקפוץ על רקע כהה
    secondary: '#38BDF8',   // תכלת זוהר מודרני (שילוב מטורף עם הכתום והכהה)
    background: '#0F111A',  // רקע כהה עמוק (אפקט אצטדיון בלילה/גיימינג)
    surface: '#1E2230',     // כרטיסי משחקים בגוון אפור-כחלחל ש"צפים" על הרקע הכהה
    border: '#2E3344',      // קווים עדינים שלא מציקים בעיניים בלילה
    text: '#F8FAFC',        // לבן שבור ונקי, קריא מאוד ולא מעייף
    muted: '#94A3B8',       // אפור-עכבר רך לשעות, תאריכים או כותרות משניות
    error: '#F87171',       // אדום מותאם למסכים כהים
    success: '#4ADE80',     // ירוק ניאון ספורטיבי ובולט
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
