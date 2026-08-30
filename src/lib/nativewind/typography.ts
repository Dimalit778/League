/**
 * TYPOGRAPHY — two free axes (SIZE + WEIGHT) + semantic VARIANT presets.
 * ---------------------------------------------------------------------------
 * 90% of the time, reach for a `variant`. It says what the text *is*, and sets
 * a sensible size + weight for you:
 *
 *   <Text variant="body">…</Text>        paragraph / reading text
 *   <Text variant="title">…</Text>       a card or row title
 *
 * Need that same style at a different size or weight? Add `size` / `weight` —
 * they override the variant (no need for a brand-new variant):
 *
 *   <Text variant="body" size="lg" />        body, but larger
 *   <Text weight="regular" size="2xl" />     free combo, no preset
 *   <Text weight="sportBold" size="3xl" />   an Oswald scoreboard number
 *
 * WHERE TO USE EACH VARIANT
 *   display    one hero word/number — the biggest thing on a screen
 *   header     screen title (top of a page)
 *   titleLarge large section heading
 *   title      card / list-row title
 *   subtitle   secondary title or a group header
 *   body       default paragraph / reading text
 *   bodySmall  dense or secondary reading text
 *   label      UI labels, buttons, tabs, chips
 *   caption    meta text — timestamps, footnotes, hints
 *
 * SIZE  = how big.      WEIGHT = which cut.
 *   Manrope: regular · medium · semibold · bold   (all UI + reading text)
 *   Oswald : sport · sportBold                     (numbers, scores, uppercase eyebrows only)
 */

/* ── Axis 1: WEIGHT (font family) ─────────────────────────────────────────── */
export type TextWeight = "regular" | "medium" | "semibold" | "bold" | "sport" | "sportBold";

export const fontWeight: Record<TextWeight, string> = {
  regular: "font-regular", // Manrope 400
  medium: "font-manrope-medium", // Manrope 500
  semibold: "font-manrope-semibold", // Manrope 600
  bold: "font-manrope-bold", // Manrope 700
  sport: "font-sport", // Oswald 400
  sportBold: "font-sport-bold", // Oswald 700
};

/* ── Axis 2: SIZE (font-size + matched line-height) ───────────────────────── */
export type TextSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";

export const fontSize: Record<TextSize, string> = {
  xs: "text-xs leading-4", // 12
  sm: "text-sm leading-5", // 14
  base: "text-base leading-6", // 16
  lg: "text-lg leading-7", // 18
  xl: "text-xl leading-7", // 20
  "2xl": "text-2xl leading-8", // 24
  "3xl": "text-3xl leading-9", // 30
  "4xl": "text-4xl leading-10", // 36
  "5xl": "text-5xl leading-[48px]", // 48
};

/* ── Semantic VARIANT presets (size + weight bundled) ─────────────────────── */
export type TextVariant =
  | "heading" // bold — any heading; pick the level with `size` (5xl hero … 2xl section)
  | "title" // semibold — card / row / group titles
  | "body" // regular — reading text
  | "label" // medium — UI: buttons, tabs, chips
  | "caption"; // regular — meta: timestamps, hints

export const typography: Record<TextVariant, string> = {
  heading: "text-2xl leading-8 font-manrope-bold",
  title: "text-xl leading-7 font-manrope-semibold",
  body: "text-base font-regular",
  label: "text-sm font-manrope-medium",
  caption: "text-xs font-regular",
};
