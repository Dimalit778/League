import { cn } from '@/lib/nativewind/nativeWind';
import { forwardRef } from 'react';
import { Pressable, type PressableProps, View } from 'react-native';
import { Text } from './Text';

export type ChipVariant = 'default' | 'selected' | 'disabled';

export type ChipProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: ChipVariant;
  className?: string;
};

export const Chip = forwardRef<View, ChipProps>(function Chip(
  { label, variant = 'default', className, disabled, ...props },
  ref,
) {
  const isDisabled = disabled || variant === 'disabled';

  return (
    <Pressable
      ref={ref}
      {...props}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, selected: variant === 'selected' }}
      className={cn(
        'min-h-11 items-center justify-center rounded-xl border px-4 active:opacity-75',
        variant === 'selected' ? 'border-primary bg-primarySoft' : 'border-border bg-surfaceSoft',
        isDisabled && 'opacity-50',
        className,
      )}
    >
      <Text variant="label" tone={variant === 'selected' ? 'primary' : 'secondary'}>
        {label}
      </Text>
    </Pressable>
  );
});
