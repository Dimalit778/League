import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativeWind';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { CText } from './CText';

interface ButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  variant?: 'primary' | 'secondary' | 'error' | 'border' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const Button = ({
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
    if (!loading && !disabled) {
      onPress();
    }
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
    secondary: 'bg-secondary',
    error: 'bg-error',
    border: 'bg-border',
    outline: 'bg-transparent border border-text',
  };

  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    error: 'text-white',
    border: 'text-white',
    outline: 'text-text',
  };

  return (
    <TouchableOpacity
      testID="button"
      className={cn(
        'rounded-[17px] items-center justify-center flex-row',
        sizeClasses[size],
        variantClasses[variant],
        (disabled || loading) && 'opacity-50',
        className
      )}
      onPress={handlePress}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <CText className={cn('font-semibold', textSizeClasses[size], textVariantClasses[variant])}>{title}</CText>
      )}
    </TouchableOpacity>
  );
};

export default Button;
