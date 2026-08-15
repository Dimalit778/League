import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsRTL } from '@/providers/LanguageProvider';
import { useState } from 'react';
import { Control, Controller, FieldError } from 'react-hook-form';
import {
  Platform,
  Pressable,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Text } from './Text';

type InputFieldProps = {
  control: Control<any>;
  name: string;
  placeholder: string;
  variant?: 'default' | 'auth';
  secureTextEntry?: boolean;
  error?: FieldError;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoComplete?: TextInputProps['autoComplete'];
  keyboardType?: TextInputProps['keyboardType'];
  textContentType?: TextInputProps['textContentType'];
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  clearError?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  textAlign?: 'left' | 'right' | 'center';
};

export const InputField = ({
  control,
  name,
  placeholder,
  variant = 'default',
  secureTextEntry,
  maxLength = 25,
  autoCapitalize = 'none',
  autoCorrect = false,
  autoComplete,
  keyboardType,
  textContentType,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  clearError,
  accessibilityLabel,
  accessibilityHint,
  textAlign,
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

  const inferredAutoComplete =
    autoComplete ?? (name === 'email' ? 'email' : name === 'password' ? 'current-password' : 'name');
  const inferredKeyboardType = keyboardType ?? (name === 'email' ? 'email-address' : 'default');
  const inferredTextContentType =
    textContentType ?? (name === 'email' ? 'emailAddress' : name === 'password' ? 'password' : 'name');
  const isAuth = variant === 'auth';
  const inputColor = isAuth ? '#F8FAFC' : colors.text;
  const fieldBg = isAuth ? 'rgba(4, 15, 31, 0.74)' : colors.surface;

  const autofillCssVars = {
    '--input-autofill-color': inputColor,
    '--input-autofill-bg': isAuth ? 'rgb(4, 15, 31)' : colors.surface,
  };
  const webFieldStyle: StyleProp<ViewStyle> =
    Platform.OS === 'web' ? (autofillCssVars as unknown as StyleProp<ViewStyle>) : undefined;
  const webInputStyle: TextInputProps['style'] =
    Platform.OS === 'web'
      ? ({ outlineStyle: 'none', ...autofillCssVars } as unknown as TextInputProps['style'])
      : undefined;

  return (
    <View className={isAuth ? 'gap-2' : 'gap-1'}>
      <View
        className={
          isAuth
            ? 'min-h-[52px] flex-row items-center overflow-hidden rounded-2xl px-2'
            : 'flex-row items-center overflow-hidden rounded-xl px-2'
        }
        style={[
          {
            direction: 'ltr',
            flexDirection: isRTL ? 'row-reverse' : 'row',
            backgroundColor: fieldBg,
            borderWidth: isFocused ? 2 : 1,
            borderColor: error
              ? colors.error
              : isFocused
                ? '#FFB31A'
                : isAuth
                  ? 'rgba(170, 181, 204, 0.72)'
                  : colors.border,
          },
          webFieldStyle,
        ]}
      >
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
              className={isAuth ? 'min-h-[52px] flex-1 px-2 py-3 text-white' : 'flex-1 px-2 py-4 text-text'}
              style={[
                {
                  textAlign: textAlign ?? (isRTL ? 'right' : 'left'),
                  color: inputColor,
                  backgroundColor: 'transparent',
                },
                webInputStyle,
              ]}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                onBlur();
                setIsFocused(false);
              }}
              onChangeText={(text) => {
                onChange(text);
                clearError?.();
              }}
              value={value ?? ''}
              maxLength={maxLength}
              autoCorrect={autoCorrect}
              autoCapitalize={autoCapitalize}
              autoComplete={inferredAutoComplete}
              keyboardType={inferredKeyboardType}
              textContentType={inferredTextContentType}
              accessible
              accessibilityLabel={getAccessibilityLabel()}
              accessibilityHint={getAccessibilityHint()}
              accessibilityLiveRegion="polite"
            />
          )}
        />

        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            className={
              isRTL ? 'mr-1 h-11 w-11 items-center justify-center' : 'ml-1 h-11 w-11 items-center justify-center'
            }
            accessible
            accessibilityRole="button"
            accessibilityLabel={t('Toggle password visibility')}
            accessibilityState={{ expanded: !secureTextEntry }}
          >
            {rightIcon}
          </Pressable>
        )}
      </View>

      {error && (
        <Text
          accessible
          accessibilityRole="text"
          accessibilityLiveRegion="assertive"
          className="text-xs text-error text-center"
        >
          {error.message && t(error.message)}
        </Text>
      )}
    </View>
  );
};
