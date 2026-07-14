import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativeWind';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Platform, Pressable } from 'react-native';
import { Text } from './Text';

interface ButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  variant?: 'primary' | 'error' | 'border' | 'outline';
  size?: 'sm' | 'md' | 'lg';
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
  const hint =
    accessibilityHint ||
    (loading
      ? t('Loading')
      : disabled
        ? t('Button disabled')
        : t('Double tap to {{action}}', { action: title.toLowerCase() }));

  const sizeClasses = {
    sm: 'px-3 py-2 min-h-[32px]',
    md: 'px-6 py-3 min-h-[44px]',
    lg: 'px-6 py-4 min-h-[52px]',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
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

  return (
    <Pressable
      testID="button"
      className={cn(
        'items-center justify-center flex-row overflow-hidden',
        sizeClasses[size],
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
        <Text
          semibold
          className={cn(textSizeClasses[size], textVariantClasses[variant])}
          style={!isIOS ? { textTransform: 'uppercase', letterSpacing: 0.5 } : undefined}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};
