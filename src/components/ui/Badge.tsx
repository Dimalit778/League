import { cn } from '@/lib/nativewind/nativeWind';
import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { Text } from './Text';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'live' | 'locked';
export type BadgeSize = 'sm' | 'md';

export type BadgeProps = ViewProps & {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  leftIcon?: ReactNode;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surfaceSoft',
  primary: 'bg-primarySoft',
  success: 'bg-successSoft',
  warning: 'bg-warningSoft',
  error: 'bg-errorSoft',
  info: 'bg-infoSoft',
  live: 'bg-errorSoft',
  locked: 'bg-surfaceSoft',
};

const textClasses: Record<BadgeVariant, string> = {
  default: 'text-textSecondary',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
  live: 'text-error',
  locked: 'text-muted',
};

export function Badge({ label, variant = 'default', size = 'sm', leftIcon, className, ...props }: BadgeProps) {
  return (
    <View
      {...props}
      accessibilityLabel={props.accessibilityLabel ?? label}
      className={cn(
        'self-start flex-row items-center gap-1 rounded-lg',
        size === 'sm' ? 'min-h-6 px-2 py-0.5' : 'min-h-8 px-3 py-1',
        variantClasses[variant],
        className,
      )}
    >
      {variant === 'live' ? <View className="h-1.5 w-1.5 rounded-full bg-error" /> : null}
      {leftIcon}
      <Text variant="caption" className={cn('font-semibold', textClasses[variant])}>
        {label}
      </Text>
    </View>
  );
}
