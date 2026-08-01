import { useThemeTokens } from '@/hooks/useThemeTokens';
import { cn } from '@/lib/nativewind/nativeWind';
import type { LucideIcon } from 'lucide-react-native';
import { forwardRef } from 'react';
import { Pressable, type PressableProps, View } from 'react-native';

export type IconButtonVariant = 'ghost' | 'soft' | 'outline' | 'primary' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export type IconButtonProps = Omit<PressableProps, 'children'> & {
  icon: LucideIcon;
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  iconSize?: number;
  className?: string;
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'h-11 w-11',
  md: 'h-11 w-11',
  lg: 'h-[52px] w-[52px]',
};

const defaultIconSizes: Record<IconButtonSize, number> = { sm: 18, md: 20, lg: 24 };

const variantClasses: Record<IconButtonVariant, string> = {
  ghost: 'bg-transparent',
  soft: 'bg-subtle',
  outline: 'border border-border bg-transparent',
  primary: 'bg-primary',
  danger: 'bg-subtle',
};

export const IconButton = forwardRef<View, IconButtonProps>(function IconButton(
  { icon: Icon, label, variant = 'ghost', size = 'md', iconSize, className, disabled, ...props },
  ref,
) {
  const { colors } = useThemeTokens();
  const iconColor = {
    ghost: colors.text,
    soft: colors.text,
    outline: colors.text,
    primary: colors.onPrimary,
    danger: colors.error,
  }[variant];

  return (
    <Pressable
      ref={ref}
      {...props}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      hitSlop={8}
      className={cn(
        'items-center justify-center rounded-xl active:opacity-75',
        sizeClasses[size],
        variantClasses[variant],
        disabled && 'opacity-50',
        className,
      )}
    >
      <Icon size={iconSize ?? defaultIconSizes[size]} color={iconColor} strokeWidth={2} />
    </Pressable>
  );
});
