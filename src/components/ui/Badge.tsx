import { cn } from '@/lib/nativewind/nativeWind';
import { type TextVariant } from '@/lib/nativewind/typography';
import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { useIsRTL } from '@/providers/LanguageProvider';
import { Text } from './Text';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'live' | 'locked';
export type BadgeSize = 'sm' | 'md' | 'lg';

export type BadgeProps = ViewProps & {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  leftIcon?: ReactNode;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-subtle',
  primary: 'bg-subtle',
  success: 'bg-subtle',
  warning: 'bg-subtle',
  error: 'bg-subtle',
  info: 'bg-subtle',
  live: 'bg-subtle',
  locked: 'bg-subtle',
};

const textClasses: Record<BadgeVariant, string> = {
  default: 'text-muted',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
  live: 'text-error',
  locked: 'text-muted',
};

const textVariants: Record<BadgeSize, TextVariant> = {
  sm: 'caption',
  md: 'body',
  lg: 'subtitle',
};

export function Badge({ label, variant = 'default', size = 'sm', leftIcon, className, ...props }: BadgeProps) {
  const isRTL = useIsRTL();

  return (
    <View
      {...props}
      accessibilityLabel={props.accessibilityLabel ?? label}
      style={[props.style, { direction: 'ltr', flexDirection: isRTL ? 'row-reverse' : 'row' }]}
      className={cn(
        'self-start flex-row items-center gap-1 rounded-full',
        size === 'sm' ? 'min-h-6 px-2 py-0.5' : size === 'lg' ? 'min-h-10 px-4 py-1.5' : 'min-h-8 px-3 py-1',
        variantClasses[variant],
        className,
      )}
    >
      {variant === 'live' ? <View className="h-1.5 w-1.5 rounded-full bg-error" /> : null}
      {leftIcon}
      <Text
        variant={textVariants[size]}
        className={cn('font-semibold', textClasses[variant])}
        style={{ textAlign: isRTL ? 'right' : 'left' }}
      >
        {label}
      </Text>
    </View>
  );
}
