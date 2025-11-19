import { Control, Controller, FieldError } from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';

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
  // Generate accessibility label from name/placeholder if not provided
  const getAccessibilityLabel = () => {
    if (accessibilityLabel) return accessibilityLabel;
    if (name === 'email') return 'Email address';
    if (name === 'password') return 'Password';
    return placeholder || `${name} input field`;
  };

  const getAccessibilityHint = () => {
    if (accessibilityHint) return accessibilityHint;
    if (secureTextEntry) return 'Enter your password securely';
    if (name === 'email') return 'Enter your email address';
    return `Enter ${placeholder.toLowerCase()}`;
  };

  return (
    <View>
      <View className="bg-surface flex-row items-center border border-text rounded-lg px-2 ">
        {icon && (
          <View className="mr-2" accessible={false}>
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
              className="flex-1 text-text py-4 "
              onBlur={onBlur}
              onChangeText={(text) => {
                onChange(text);
                // Clear auth error when user starts typing
                if (name === 'email' || name === 'password') {
                  clearError?.(); // Optional chaining in case clearError isn't passed
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
              accessibilityState={{ invalid: !!error }}
              accessibilityLiveRegion="polite"
            />
          )}
        />
        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            className="ml-2 p-1"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Toggle password visibility"
          >
            {rightIcon}
          </Pressable>
        )}
      </View>
      {error && (
        <Text 
          className="text-red-500 mt-1 text-sm"
          accessible={true}
          accessibilityRole="text"
          accessibilityLiveRegion="assertive"
        >
          {error.message}
        </Text>
      )}
    </View>
  );
};

export default InputField;
