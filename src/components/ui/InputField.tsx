import { Control, Controller, FieldError } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";

type InputFieldProps = {
  control: Control<any>;
  name: string;
  placeholder: string;
  secureTextEntry?: boolean;
  error?: FieldError;
};

const InputField = ({
  control,
  name,
  placeholder,
  secureTextEntry,
  error,
}: InputFieldProps) => (
  <View className="mb-4">
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#aaa"
          secureTextEntry={secureTextEntry}
          style={styles.input}
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
        />
      )}
    />
    {error && (
      <Text className="text-red-500 mt-1 text-sm">{error.message}</Text>
    )}
  </View>
);
const styles = StyleSheet.create({
  input: {
    backgroundColor: "#242424",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#888",
    color: "#fff",
  },
});

export default InputField;
