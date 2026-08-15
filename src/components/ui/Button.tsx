import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { setColorAlpha } from '@/lib/color';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef, type ReactNode } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { ArrowIcon } from './ArrowIcon';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'glass' | 'error';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  children?: ReactNode;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  haptic?: boolean;
  className?: string;
  arrowIcon?: boolean;
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3',
  md: 'min-h-11 px-4',
  lg: 'min-h-[52px] px-6',
  icon: 'h-11 w-11 p-0',
};

const textSizeClasses: Record<ButtonSize, string> = {
  sm: 'text-base',
  md: 'text-base',
  lg: 'text-lg',
  icon: 'text-base',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-subtle',
  outline: 'border border-border bg-transparent',

  // הרקע והמסגרת של glass מוגדרים ב-style
  glass: 'bg-transparent',

  error: 'bg-error',
};

const textToneClasses: Record<ButtonVariant, string> = {
  primary: 'text-onPrimary',
  secondary: 'text-text',
  outline: 'text-text',
  glass: 'text-text',
  error: 'text-white',
};

export const Button = forwardRef<View, ButtonProps>(function Button(
  {
    children,
    label,
    variant = 'primary',
    size = 'md',
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
  const { colors, theme, effects, gradients } = useThemeTokens();
  const { t } = useTranslation();

  const isDisabled = disabled || loading;
  const isGlass = variant === 'glass';
  const isLightGlass = isGlass && theme === 'light';

  const accessibleLabel = accessibilityLabel ?? label;
  const action = label ?? accessibilityLabel ?? t('button');

  const handlePress: NonNullable<PressableProps['onPress']> = (event) => {
    if (isDisabled) return;

    if (haptic && Platform.OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress?.(event);
  };

  const spinnerColor = variant === 'primary' ? colors.onPrimary : variant === 'error' ? '#FFFFFF' : colors.text;
  const arrowColor = variant === 'primary' ? colors.onPrimary : variant === 'error' ? '#FFFFFF' : colors.text;

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
        'relative flex-row items-center justify-center overflow-hidden rounded-xl',
        'active:opacity-85',
        spacing.row,
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
        className,
      )}
      style={({ pressed }) => [
        isGlass && {
          borderWidth: StyleSheet.hairlineWidth * 1.5,
          borderColor: effects.cardBorder,
          shadowColor: effects.cardShadow,
          shadowOpacity: isLightGlass ? 0.06 : 0.18,
          shadowRadius: isLightGlass ? 8 : 12,
          shadowOffset: {
            width: 0,
            height: isLightGlass ? 3 : 5,
          },
          elevation: isLightGlass ? 1 : 2,
        },

        pressed && {
          transform: [{ scale: 0.985 }],
        },

        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
      ]}
    >
      {isGlass && (
        <>
          {!isLightGlass && (
            <BlurView
              pointerEvents="none"
              intensity={Platform.OS === 'ios' ? 35 : 20}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          )}

          <LinearGradient
            pointerEvents="none"
            colors={[...gradients.card]}
            locations={[0, 0.45, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {!isLightGlass && (
            <LinearGradient
              pointerEvents="none"
              colors={[effects.cardHighlight, setColorAlpha(effects.cardHighlight, 0)]}
              locations={[0, 1]}
              style={styles.glassHighlight}
            />
          )}
        </>
      )}

      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <View className={cn('flex-row items-center justify-center', spacing.row)}>
          {leftIcon}

          {label ? (
            <Text className={cn('font-semibold', textSizeClasses[size], textToneClasses[variant])}>{label}</Text>
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

const styles = StyleSheet.create({
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
});
