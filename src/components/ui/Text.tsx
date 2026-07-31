import { cn } from '@/lib/nativewind/nativeWind';
import { typography, type TextVariant } from '@/lib/nativewind/typography';
import { useIsRTL } from '@/providers/LanguageProvider';
import { forwardRef } from 'react';
import { Text as RNText, type TextProps } from 'react-native';

export type TextTone =
  | 'default'
  | 'secondary'
  | 'muted'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'inverse';

type FontFamily = 'system' | 'teko' | 'teko-bold';

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  /** @deprecated Prefer a semantic variant. */
  font?: FontFamily;
  className?: string;
};

const fontClasses: Record<FontFamily, string> = {
  system: '',
  teko: 'font-teko',
  'teko-bold': 'font-teko-bold',
};

const toneClasses: Record<TextTone, string> = {
  default: 'text-text',
  secondary: 'text-textSecondary',
  muted: 'text-muted',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
  inverse: 'text-primaryForeground',
};

export const Text = forwardRef<RNText, AppTextProps>(function Text(
  { variant = 'body', tone = 'default', font = 'system', className, style, ...rest },
  ref,
) {
  const isRTL = useIsRTL();
  const hasExplicitAlign = /\btext-(left|center|right|justify|start|end)\b/.test(className ?? '');

  return (
    <RNText
      ref={ref}
      {...rest}
      className={cn(typography[variant], toneClasses[tone], fontClasses[font], className)}
      style={[
        { writingDirection: isRTL ? 'rtl' : 'ltr' },
        // Don't override className text-align (e.g. text-center)
        !hasExplicitAlign ? { textAlign: isRTL ? 'right' : 'left' } : null,
        style,
      ]}
    />
  );
});
