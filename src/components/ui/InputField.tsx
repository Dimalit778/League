import { Control, Controller, FieldError } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

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
}: InputFieldProps) => (
  <View>
    <View className="bg-surface flex-row items-center border border-text rounded-lg px-2 my-2 ">
      <View className="mr-2">{icon}</View>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder={placeholder}
            placeholderTextColor="#aaa"
            secureTextEntry={secureTextEntry}
            className="flex-1 text-text px-2 py-4"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            maxLength={maxLength}
            autoCorrect={autoCorrect}
            autoCapitalize={autoCapitalize}
          />
        )}
      />
    </View>
    {error && (
      <Text className="text-red-500 mt-1 text-sm">{error.message}</Text>
    )}
  </View>
);

export default InputField;
