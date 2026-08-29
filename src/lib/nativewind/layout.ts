export const layout = {
  screen: "flex-1 bg-background",
  screenPaddingHorizontal: "px-4 sm:px-6 lg:px-8",
  screenPaddingAll: "p-4 sm:p-6 lg:p-8",
  section: "gap-6",
  row: "flex-row items-center",
  rowBetween: "flex-row items-center justify-between",
  center: "items-center justify-center",
} as const;

export const screenWidths = {
  compact: "max-w-sm",
  content: "max-w-2xl",
  wide: "max-w-4xl",
  full: "max-w-none",
} as const;

export type ScreenWidth = keyof typeof screenWidths;

export const container = {
  form: "mx-auto w-full max-w-[520px] ",

  content: "mx-auto w-full max-w-[600px] lg:max-w-[680px]",

  wide: "mx-auto w-full max-w-[900px]",
} as const;

export type ContainerWidth = keyof typeof container;
