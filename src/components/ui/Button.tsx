import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativeWind';
import * as Haptics from 'expo-haptics';
import { ReactNode } from 'react';
import { ActivityIndicator, Platform, Pressable } from 'react-native';
import { Text } from './Text';

interface ButtonProps {
  title?: string;
  onPress: () => void;
  color?: string;
  variant?: 'primary' | 'error' | 'border' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const isIOS = Platform.OS === 'ios';

const BORDER_RADIUS = isIOS ? 12 : 10;

const RIPPLE_COLORS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'rgba(0,0,0,0.18)',

  error: 'rgba(0,0,0,0.18)',
  border: 'rgba(0,0,0,0.18)',
  outline: 'rgba(255,255,255,0.12)',
};

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'start',
  className = '',
  loading = false,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) => {
  const { t } = useTranslation();

  const handlePress = () => {
    if (loading || disabled) return;
    if (isIOS) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const label = accessibilityLabel || title;
  const action = title || accessibilityLabel || t('button');
  const hint =
    accessibilityHint ||
    (loading
      ? t('Loading')
      : disabled
        ? t('Button disabled')
        : t('Double tap to {{action}}', { action: action.toLowerCase() }));

  const sizeClasses = {
    sm: 'h-[32px]',
    md: 'h-[44px]',
    lg: 'h-[52px]',
  };

  const horizontalPaddingClasses = {
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
  };

  const iconStartPaddingClasses = {
    sm: 'pl-3 pr-4',
    md: 'pl-5 pr-6',
    lg: 'pl-6 pr-8',
  };

  const iconEndPaddingClasses = {
    sm: 'pl-4 pr-3',
    md: 'pl-6 pr-5',
    lg: 'pl-8 pr-6',
  };

  const iconGapClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-2',
  };

  const textSizeClasses = {
    sm: 'text-sm leading-[14px]',
    md: 'text-base leading-5',
    lg: 'text-base leading-5',
  };

  const variantClasses = {
    primary: 'bg-primary',
    error: 'bg-error',
    border: 'bg-border',
    outline: 'bg-transparent border border-muted',
  };

  const textVariantClasses = {
    primary: 'text-white  ',
    error: 'text-error',
    border: 'text-text',
    outline: 'text-text',
  };

  const iconOnly = Boolean(icon && !title);
  const contentSpacingClass = iconOnly
    ? 'p-0 aspect-square'
    : icon
      ? cn(
          iconPosition === 'start' ? iconStartPaddingClasses[size] : iconEndPaddingClasses[size],
          iconGapClasses[size],
        )
      : horizontalPaddingClasses[size];

  return (
    <Pressable
      testID="button"
      className={cn(
        'items-center justify-center flex-row overflow-hidden',
        sizeClasses[size],
        contentSpacingClass,
        variantClasses[variant],
        (disabled || loading) && 'opacity-50',
        isIOS && 'active:opacity-50',
        className,
      )}
      style={{ borderRadius: BORDER_RADIUS }}
      onPress={handlePress}
      disabled={disabled || loading}
      android_ripple={!isIOS ? { color: RIPPLE_COLORS[variant], borderless: false } : undefined}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          {iconPosition === 'start' && icon}
          {title ? (
            <Text
              semibold
              className={cn(textSizeClasses[size], textVariantClasses[variant])}
              style={!isIOS ? { textTransform: 'uppercase', letterSpacing: 0.5 } : undefined}
            >
              {title}
            </Text>
          ) : null}
          {iconPosition === 'end' && icon}
        </>
      )}
    </Pressable>
  );
};
