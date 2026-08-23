export type TextVariant =
  | "display"
  | "header"
  | "title"
  | "titleLarge"
  | "subtitle"
  | "body"
  | "bodySmall"
  | "small"
  | "label"
  | "caption";

export const typography: Record<TextVariant, string> = {
  display: "text-5xl leading-[48px] font-nunito-bold",
  header: "text-3xl leading-[30px] font-nunito-bold",
  titleLarge: "text-2xl leading-[28px] font-nunito-bold",
  title: "text-xl leading-7 font-semibold",
  subtitle: "text-lg leading-6 font-semibold",
  body: "text-base",
  bodySmall: "text-sm leading-5",
  small: "text-sm",
  label: "text-sm font-medium",
  caption: "text-xs ",
};
