import { cn } from '@/lib/nativewind/nativeWind';
import { fontSize, fontWeight, typography, type TextSize, type TextVariant, type TextWeight } from '@/lib/nativewind/typography';
import { useIsRTL } from '@/providers/LanguageProvider';
import { forwardRef } from 'react';
import { Text as RNText, type TextProps } from 'react-native';

export type TextTone =
  | 'default'
  | 'secondary'
  | 'onPrimary'
  | 'muted'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'inverse';

export type AppTextProps = TextProps & {
  /** Semantic preset — sets a sensible size + weight. Start here. */
  variant?: TextVariant;
  /** Override just the size (keeps the variant's weight). */
  size?: TextSize;
  /** Override just the weight/family (keeps the variant's size). */
  weight?: TextWeight;
  tone?: TextTone;
  ltr?: boolean;
  className?: string;
};

const toneClasses: Record<TextTone, string> = {
  default: 'text-text',
  secondary: 'text-muted',
  onPrimary: 'text-onPrimary',
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
    size,
    weight,
    tone = 'default',
    ltr = false,
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
      className={cn(
        typography[variant],
        size && fontSize[size],
        weight && fontWeight[weight],
        toneClasses[tone],
        className,
      )}
      style={[
        { writingDirection: ltr || !isRTL ? 'ltr' : 'rtl' },
        !hasExplicitAlign ? { textAlign: isRTL ? 'right' : 'left' } : null,
        style,
      ]}
    />
  );
});
