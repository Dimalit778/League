import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import * as Haptics from 'expo-haptics';
import { forwardRef, type ReactNode } from 'react';
import { ActivityIndicator, Platform, Pressable, View, type PressableProps } from 'react-native';

import { ArrowIcon } from './ArrowIcon';
import { Text, type TextTone } from './Text';

export type ButtonIntent = 'primary' | 'neutral' | 'outline' | 'destructive';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-lg';

export type ButtonShape = 'default' | 'circle';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  children?: ReactNode;
  label?: string;
  intent?: ButtonIntent;
  size?: ButtonSize;
  shape?: ButtonShape;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  haptic?: boolean;
  className?: string;
  arrowIcon?: boolean;
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3',
  md: 'min-h-12 px-4',
  lg: 'min-h-[52px] px-6',
  icon: 'h-12 w-12 p-0',
  'icon-lg': 'h-[64px] w-[64px] p-0',
};

const textSizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  icon: 'text-base',
  'icon-lg': 'text-base',
};

const intentClasses: Record<ButtonIntent, string> = {
  primary: 'bg-primary',
  neutral: 'bg-subtle',
  outline: 'border border-border bg-transparent',
  destructive: 'bg-danger',
};

const textToneByIntent: Record<ButtonIntent, TextTone> = {
  primary: 'onPrimary',
  neutral: 'default',
  outline: 'default',
  destructive: 'inverse',
};
export const Button = forwardRef<View, ButtonProps>(function Button(
  {
    children,
    label,
    intent = 'primary',
    size = 'md',
    shape = 'default',
    fullWidth = false,
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    haptic = true,
    className,
    accessibilityLabel,
    accessibilityHint,
    arrowIcon = false,
    onPress,
    style,
    ...props
  },
  ref,
) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  const isDisabled = disabled || loading;

  const accessibleLabel = accessibilityLabel ?? label;
  const action = label ?? accessibilityLabel ?? t('button');

  const handlePress: NonNullable<PressableProps['onPress']> = (event) => {
    if (isDisabled) return;

    if (haptic && Platform.OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress?.(event);
  };

  // primary/destructive sit on a filled background → use onPrimary for icons/spinner too.
  const onFill = intent === 'primary' || intent === 'destructive';
  const spinnerColor = onFill ? colors.onPrimary : colors.text;
  const arrowColor = onFill ? colors.onPrimary : colors.text;

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
            : t('Double tap to {{action}}', {
                action: action.toLowerCase(),
              }))
      }
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      className={cn(
        'relative flex-row items-center justify-center overflow-hidden',
        shape === 'circle' ? 'rounded-full' : 'rounded-xl',
        isDisabled ? 'opacity-50' : 'active:opacity-85',
        spacing.row,
        sizeClasses[size],
        intentClasses[intent],
        fullWidth && 'w-full',
        className,
      )}
      style={(state) => [
        state.pressed &&
          !isDisabled && {
            transform: [{ scale: 0.985 }],
          },

        typeof style === 'function' ? style(state) : style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <View className={cn('flex-row items-center justify-center', spacing.row)}>
          {leftIcon}

          {label ? (
            <Text weight="bold" tone={textToneByIntent[intent]} className={textSizeClasses[size]}>
              {label}
            </Text>
          ) : (
            children
          )}

          {rightIcon}
          {arrowIcon ? <ArrowIcon size={18} color={arrowColor} strokeWidth={2} direction="forward" /> : null}
        </View>
      )}
    </Pressable>
  );
});
