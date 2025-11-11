import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  variant?: 'primary' | 'secondary' | 'error' | 'border';
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
  color = '',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) => {
  const handlePress = () => {
    if (!loading && !disabled) {
      onPress();
    }
  };

  // Generate accessibility label from title if not provided
  const label = accessibilityLabel || title;
  const hint = accessibilityHint || (loading ? 'Loading' : disabled ? 'Button disabled' : `Double tap to ${title.toLowerCase()}`);

  return (
    <TouchableOpacity
      testID="button"
      className={`${className} ${
        color
          ? ''
          : `px-4 py-2 bg-${variant} rounded-md ${
              disabled || loading ? 'opacity-50' : ''
            }`
      }
      }`}
      style={[
        styles.button,
        styles[size],
        (disabled || loading) && styles.disabled,
        color ? { backgroundColor: color, borderRadius: 8 } : null,
      ]}
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
        <Text className="text-background text-sm font-semibold">{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 32,
  },
  md: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 52,
  },
  disabled: {
    opacity: 0.8,
  },
});

export default Button;
