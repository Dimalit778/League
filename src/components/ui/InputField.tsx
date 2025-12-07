import { CText } from '@/components/ui/CText';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsRTL } from '@/providers/LanguageProvider';
import { Control, Controller, FieldError } from 'react-hook-form';
import { Pressable, TextInput, View } from 'react-native';

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

const InputField = ({
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

  return (
    <View>
      <View className="bg-surface flex-row items-center border border-text rounded-lg px-2 ">
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
              placeholderTextColor="#aaa"
              secureTextEntry={secureTextEntry}
              className="flex-1 text-text py-4"
              style={{ textAlign: isRTL ? 'right' : 'left' }}
              onBlur={onBlur}
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
              accessible={true}
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
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={t('Toggle password visibility')}
          >
            {rightIcon}
          </Pressable>
        )}
      </View>
      {error && (
        <CText
          className="text-red-500 mt-1 text-sm text-center"
          accessible={true}
          accessibilityRole="text"
          accessibilityLiveRegion="assertive"
        >
          {t(error.message ?? '')}
        </CText>
      )}
    </View>
  );
};

export default InputField;
