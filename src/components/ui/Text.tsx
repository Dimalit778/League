import { cn } from '@/lib/nativewind/nativeWind';
import {
  fontSize,
  fontWeight,
  typography,
  type TextSize,
  type TextVariant,
  type TextWeight,
} from '@/lib/nativewind/typography';
import { useIsRTL } from '@/providers/LanguageProvider';
import { forwardRef } from 'react';
import { Platform, Text as RNText, useWindowDimensions, type TextProps } from 'react-native';

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
  | 'gold'
  | 'inverse';

export type AppTextProps = TextProps & {
  variant?: TextVariant;

  size?: TextSize;

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
  gold: 'text-gold',
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
  const { fontScale } = useWindowDimensions();
  const hasExplicitAlign = /\btext-(left|center|right|justify|start|end)\b/.test(className ?? '');

  return (
    <RNText
      key={Platform.OS === 'ios' && allowFontScaling ? `text-scale-${fontScale}` : undefined}
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
