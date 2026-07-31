export type TextVariant =
  | 'display'
  | 'header'
  | 'title'
  | 'titleLarge'
  | 'subtitle'
  | 'body'
  | 'bodySmall'
  | 'label'
  | 'caption';

export const typography: Record<TextVariant, string> = {
  display: 'text-5xl leading-[58px] font-teko-bold',
  header: 'text-3xl leading-[40px] font-teko-bold',
  titleLarge: 'text-2xl leading-7 font-semibold',
  title: 'text-xl leading-7 font-semibold',
  subtitle: 'text-lg leading-6 font-semibold',
  body: 'text-base leading-6',
  bodySmall: 'text-sm leading-5',
  label: 'text-sm leading-5 font-medium',
  caption: 'text-xs leading-4',
};