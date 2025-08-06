import { ButtonC, InputField, TextC } from "@/components/ui";
import ThemeToggle from "@/context/ThemeToggle";
import { useColorScheme } from "@/hooks/useColorSchema";
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
  fullname: yup
    .string()
    .required("Full name is required")
    .min(3, "Full name must be at least 3 characters"),
});

export default function SignUpScreen() {
  const { colorScheme } = useColorScheme();
  const { register, loading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data: any) => {
    const { error } = await register(
      data.email.trim(),
      data.password,
      data.fullname
    );
    if (error) {
      console.log(error);
    }
  };
  const handleGoogleSignIn = async () => {};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 justify-center px-5"
      style={{
        backgroundColor: colorScheme === "dark" ? "#1A1A1A" : "#f5f5f5",
      }}
    >
      <ThemeToggle />
      <TextC className="text-3xl font-bold text-center mb-5">
        Create an account
      </TextC>
      <TextC className="text-center font-semibold mb-5">
        Sign up to get started
      </TextC>
      <InputField
        control={control}
        name="fullname"
        placeholder="Full Name"
        error={errors.fullname}
      />

      <InputField
        control={control}
        name="email"
        placeholder="Email"
        error={errors.email}
      />
      <InputField
        control={control}
        name="password"
        placeholder="Password"
        secureTextEntry={!showPassword}
        error={errors.password}
      />

      <ButtonC
        title="Sign Up"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        disabled={!isValid || loading}
        variant="secondary"
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
        Already have an account?{" "}
        <Link href="/signIn">
          <Text className="text-blue-500 font-bold">Sign In</Text>
        </Link>
      </Text>
    </KeyboardAvoidingView>
  );
}
