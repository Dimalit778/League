import { type ClassValue, clsx } from "clsx";
import { vars } from "nativewind";
import { twMerge } from "tailwind-merge";
import { radiusValues } from "./radius";
import { spacingValues } from "./spacing";

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
  danger: string;
  info: string;
  gold: string;
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

  spacing: typeof spacingValues;
  radius: typeof radiusValues;
};

const lightColors = {
  primary: "#9A6F16",
  onPrimary: "#FFFFFF",

  background: "#F1F4F8",
  surface: "#FFFFFF",
  subtle: "#EEF2F7",

  text: "#0F1B2A",
  muted: "#647587",

  border: "rgba(15,23,42,0.07)",

  success: "#15803D",
  warning: "#C2410C",
  error: "#DC2626",
  danger: "#E11D2E",
  info: "#0369A1",
  gold: "#B8860B",

  overlay: "rgba(17,24,39,0.28)",
} as const;
const darkColors = {
  primary: "#C99A2E",
  onPrimary: "#0B1118",

  background: "#08111C",
  surface: "#0D1722",
  subtle: "#121E2B",

  text: "#F4F7FB",
  muted: "#8B98A8",

  border: "rgba(255,255,255,0.08)",

  success: "#22C55E",
  warning: "#F59E0B",
  error: "#F87171",
  danger: "#EF4444",
  info: "#38BDF8",
  gold: "#F5C518",

  overlay: "rgba(0,0,0,0.6)",
} as const;

const lightGradients: ThemeGradients = {
  hero: ["#FFFFFF", "#F7F8FA", "#F1F3F6"],

  premium: ["#FFF8E8", "#FFF4D8", "#F7F8FA"],

  card: ["#FFFFFF", "#FAFBFC", "#F5F6F8"],
};

const darkGradients: ThemeGradients = {
  hero: ["#0C1825", "#09131F", "#08111C"],
  premium: ["#171A16", "#101712", "#08111C"],
  card: ["#101B27", "#0D1722", "#0D1722"],
};

const lightEffects: ThemeEffects = {
  cardBorder: "rgba(15,23,42,0.06)",
  cardHighlight: "rgba(255,255,255,0.95)",
  cardShadow: "#0F1B2A",

  cardGlow: "rgba(154,111,22,0.05)",
  cardActiveGlow: "rgba(154,111,22,0.10)",
};

const darkEffects: ThemeEffects = {
  cardBorder: "rgba(255,255,255,0.08)",
  cardHighlight: "rgba(255,255,255,0.04)",
  cardShadow: "#000000",
  cardGlow: "rgba(201,154,46,0.08)",
  cardActiveGlow: "rgba(201,154,46,0.14)",
};

const sharedTokens = {
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
  "--color-primary": tokens.colors.primary,
  "--color-on-primary": tokens.colors.onPrimary,
  "--color-background": tokens.colors.background,
  "--color-surface": tokens.colors.surface,
  "--color-subtle": tokens.colors.subtle,
  "--color-text": tokens.colors.text,
  "--color-muted": tokens.colors.muted,
  "--color-border": tokens.colors.border,
  "--color-success": tokens.colors.success,
  "--color-warning": tokens.colors.warning,
  "--color-error": tokens.colors.error,
  "--color-danger": tokens.colors.danger,
  "--color-info": tokens.colors.info,
  "--color-gold": tokens.colors.gold,
  "--color-overlay": tokens.colors.overlay,
});

export const themeTokens = { light, dark } as const;
export type ThemeName = keyof typeof themeTokens;

export const themes = {
  light: vars(getNativeWindVariables(light)),
  dark: vars(getNativeWindVariables(dark)),
};

export const getThemeColor = (theme: ThemeName, color: keyof ThemeColors) =>
  themeTokens[theme].colors[color];
export const getThemeTokens = (theme: ThemeName): ThemeTokens =>
  themeTokens[theme];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
