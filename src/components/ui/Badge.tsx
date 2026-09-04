import { cn } from '@/lib/nativewind/nativeWind';
import { useIsRTL } from '@/providers/LanguageProvider';
import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { Text, type TextTone } from './Text';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md';

export type BadgeProps = ViewProps & {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;

  radius?: 'circle' | number;
  leftIcon?: ReactNode;
  className?: string;
};

export function Badge({
  label,
  variant = 'default',
  size = 'sm',
  radius = 'circle',
  leftIcon,
  className,
  ...props
}: BadgeProps) {
  const isRTL = useIsRTL();
  const tone: TextTone = variant === 'primary' ? 'onPrimary' : variant === 'default' ? 'default' : variant;
  const isCircle = radius === 'circle';

  return (
    <View
      {...props}
      accessibilityLabel={props.accessibilityLabel ?? label}
      style={[props.style, { flexDirection: isRTL ? 'row-reverse' : 'row' }, !isCircle && { borderRadius: radius }]}
      className={cn(
        'items-center justify-center',
        isCircle && 'rounded-full',
        size === 'md' ? 'w-9 h-9' : 'w-6 h-6',
        variant === 'primary' ? 'bg-primary' : 'bg-border',
        className,
      )}
    >
      {leftIcon}
      <Text variant={size === 'md' ? 'body' : 'caption'} weight="sport" tone={tone}>
        {label}
      </Text>
    </View>
  );
}
