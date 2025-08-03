import { ButtonC, InputField, TextC } from "@/components/ui";
import { useColorScheme } from "@/context/useColorSchema";
import useAuthStore from "@/services/store/AuthStore";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import * as yup from "yup";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),
});

export default function SignIn() {
  const { colorScheme } = useColorScheme();
  const { login, loading } = useAuthStore();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data: any) => {
    const { error } = await login(data.email.trim(), data.password);
    if (error) {
      console.log(error);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 justify-center px-5"
      style={{
        backgroundColor: colorScheme === "dark" ? "#242424" : "#fff",
      }}
    >
      <TextC className="text-3xl font-bold text-center mb-5">
        Welcome Back
      </TextC>
      <TextC className="text-center font-semibold mb-5">
        Sign in to your account
      </TextC>
      <InputField
        control={control}
        name="email"
        placeholder="Email"
        secureTextEntry={false}
        error={errors.email}
      />

      <InputField
        control={control}
        name="password"
        placeholder="Password"
        secureTextEntry
        error={errors.password}
      />

      <ButtonC
        title="Log In"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        disabled={!isValid || loading}
        variant="gray"
        size="lg"
      />
      <View className="flex-row items-center my-4">
        <View className="flex-1 h-px bg-gray-600" />
        <Text className="text-gray-400 mx-2">OR</Text>
        <View className="flex-1 h-px bg-gray-600" />
      </View>
      <ButtonC
        title="Continue with Google"
        onPress={() => {}}
        loading={loading}
        variant="primary"
        size="md"
      />

      <Text className="text-white text-center mt-5 ">
        Don't have an account?{" "}
        <Link href="/signUp">
          <Text className="text-blue-500 font-bold">Sign Up</Text>
        </Link>
      </Text>
    </KeyboardAvoidingView>
  );
}
