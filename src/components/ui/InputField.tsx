import { Text } from '@/components/ui/Text';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsRTL } from '@/providers/LanguageProvider';
import { useState } from 'react';
import { Control, Controller, FieldError } from 'react-hook-form';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

type InputFieldProps = {
  control: Control<any>;
  name: string;
  placeholder: string;
  secureTextEntry?: boolean;
  error?: FieldError;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  clearError?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

const isIOS = Platform.OS === 'ios';

export const InputField = ({
  control,
  name,
  placeholder,
  secureTextEntry,
  maxLength = 50,
  autoCapitalize = 'none',
  autoCorrect = false,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  clearError,
  accessibilityLabel,
  accessibilityHint,
}: InputFieldProps) => {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const { colors } = useThemeTokens();
  const [isFocused, setIsFocused] = useState(false);

  const getAccessibilityLabel = () => {
    if (accessibilityLabel) return accessibilityLabel;
    if (name === 'email') return t('Email address');
    if (name === 'password') return t('Password');
    return placeholder || t('{{name}} input field', { name });
  };

  const getAccessibilityHint = () => {
    if (accessibilityHint) return accessibilityHint;
    if (secureTextEntry) return t('Enter your password securely');
    if (name === 'email') return t('Enter your email address');
    return t('Enter {{placeholder}}', { placeholder: placeholder.toLowerCase() });
  };

  const containerStyle = [
    isIOS ? styles.iosContainer : styles.androidContainer,
    {
      backgroundColor: colors.surface,
      borderWidth: isFocused ? 2 : 1,
      borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
    },
  ];

  return (
    <View className="gap-1">
      <View style={containerStyle} className="flex-row items-center px-2">
        {icon && (
          <View className={isRTL ? 'ml-2' : 'mr-2'} accessible={false}>
            {icon}
          </View>
        )}

        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder={placeholder}
              placeholderTextColor={colors.muted}
              secureTextEntry={secureTextEntry}
              className="flex-1 text-text py-4 px-2"
              style={{
                textAlign: isRTL ? 'right' : 'left',
                color: colors.text,
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                onBlur();
                setIsFocused(false);
              }}
              onChangeText={(text) => {
                onChange(text);
                if (name === 'email' || name === 'password') {
                  clearError?.();
                }
              }}
              value={value}
              maxLength={maxLength}
              autoCorrect={autoCorrect}
              autoCapitalize={autoCapitalize}
              accessible
              accessibilityRole="text"
              accessibilityLabel={getAccessibilityLabel()}
              accessibilityHint={getAccessibilityHint()}
              accessibilityLiveRegion="polite"
            />
          )}
        />

        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            className={isRTL ? 'mr-2 p-1' : 'ml-2 p-1'}
            accessible
            accessibilityRole="button"
            accessibilityLabel={t('Toggle password visibility')}
          >
            {rightIcon}
          </Pressable>
        )}
      </View>

      {error && (
        <Text accessible accessibilityRole="text" accessibilityLiveRegion="assertive" className="text-xs text-error text-center">
          {error.message && t(error.message)}
        </Text>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  iosContainer: {
    borderRadius: 10,
  },
  androidContainer: {
    borderRadius: 8,
  },
});
