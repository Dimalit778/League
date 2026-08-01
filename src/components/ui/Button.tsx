import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { useIsRTL } from '@/providers/LanguageProvider';
import * as Haptics from 'expo-haptics';
import { forwardRef, type ReactNode } from 'react';
import { ActivityIndicator, Platform, Pressable, type PressableProps, View } from 'react-native';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'success' | 'error' | 'border';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  children?: ReactNode;
  label?: string;
  /** @deprecated Prefer label. */
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** @deprecated Prefer leftIcon/rightIcon. */
  icon?: ReactNode;
  /** @deprecated Prefer leftIcon/rightIcon. */
  iconPosition?: 'start' | 'end';
  haptic?: boolean;
  className?: string;
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3',
  md: 'min-h-11 px-4',
  lg: 'min-h-[52px] px-6',
  icon: 'h-11 w-11 p-0',
};

const textSizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  icon: 'text-base',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-subtle',
  outline: 'border border-border bg-transparent',

  success: 'bg-success',
  error: 'bg-error',
  border: 'bg-border',
};

const textToneClasses: Record<ButtonVariant, string> = {
  primary: 'text-onPrimary',
  secondary: 'text-text',
  outline: 'text-text',

  success: 'text-white',
  error: 'text-white',
  border: 'text-text',
};

export const Button = forwardRef<View, ButtonProps>(function Button(
  {
    children,
    label,
    title,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    icon,
    iconPosition = 'start',
    haptic = true,
    className,
    accessibilityLabel,
    accessibilityHint,
    onPress,
    ...props
  },
  ref,
) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const buttonLabel = label ?? title;
  const leadingIcon = leftIcon ?? (iconPosition === 'start' ? icon : undefined);
  const trailingIcon = rightIcon ?? (iconPosition === 'end' ? icon : undefined);
  const isDisabled = disabled || loading;
  const accessibleLabel = accessibilityLabel ?? buttonLabel;
  const action = buttonLabel ?? accessibilityLabel ?? t('button');

  const handlePress: NonNullable<PressableProps['onPress']> = (event) => {
    if (isDisabled) return;
    if (haptic && Platform.OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  return (
    <Pressable
      ref={ref}
      {...props}
      testID={props.testID ?? 'button'}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibleLabel}
      accessibilityHint={
        accessibilityHint ??
        (loading
          ? t('Loading')
          : disabled
            ? t('Button disabled')
            : t('Double tap to {{action}}', { action: action.toLowerCase() }))
      }
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={cn(
        'flex-row items-center justify-center rounded-xl active:opacity-85',
        spacing.row,
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.onPrimary : colors.text} size="small" />
      ) : (
        <View className={cn('flex-row items-center justify-center', spacing.row, isRTL && 'flex-row-reverse')}>
          {leadingIcon}
          {buttonLabel ? (
            <Text className={cn('font-semibold', textSizeClasses[size], textToneClasses[variant])}>{buttonLabel}</Text>
          ) : (
            children
          )}
          {trailingIcon}
        </View>
      )}
    </Pressable>
  );
});
