export type ShadowVariant = 'none' | 'sm' | 'md' | 'lg';

export const shadow: Record<ShadowVariant, string> = {
  none: 'shadow-none elevation-0',
  sm: 'shadow-sm elevation-1',
  md: 'shadow-md elevation-3',
  lg: 'shadow-lg elevation-6',
};
