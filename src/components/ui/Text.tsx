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

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
};

const toneClasses: Record<TextTone, string> = {
  default: 'text-text',
  secondary: 'text-muted',
  muted: 'text-muted',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
  inverse: 'text-onPrimary',
};

export const Text = forwardRef<RNText, AppTextProps>(function Text(
  {
    variant = 'body',
    tone = 'default',
    className,
    style,
    allowFontScaling = true,
    maxFontSizeMultiplier = 2,
    ...rest
  },
  ref,
) {
  const isRTL = useIsRTL();
  const hasExplicitAlign = /\btext-(left|center|right|justify|start|end)\b/.test(className ?? '');

  return (
    <RNText
      ref={ref}
      {...rest}
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      className={cn(typography[variant], toneClasses[tone], className)}
      style={[
        { writingDirection: isRTL ? 'rtl' : 'ltr' },
        !hasExplicitAlign ? { textAlign: isRTL ? 'right' : 'left' } : null,
        style,
      ]}
    />
  );
});
