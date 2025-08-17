import { Button, InputField } from "@/components/ui";
import { useTheme } from "@/context/ThemeContext";
import { useAppStore } from "@/store/useAppStore";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import * as yup from "yup";
import { EmailIcon, LockIcon } from "../../../assets/icons";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),
});

export default function SignIn() {
  const { theme } = useTheme();
  const { login, loading } = useAppStore();
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
      className="flex-1 bg-background  px-5"
    >
      <View className="py-10">
        <Text className="text-4xl text-primary font-bold text-center mb-5">
          Welcome Back
        </Text>

        <Text className="text-center text-textMuted font-semibold mb-5">
          Sign in to your account
        </Text>
      </View>
      <View className="flex-1 mt-10">
        <InputField
          control={control}
          name="email"
          placeholder="Email"
          secureTextEntry={false}
          error={errors.email}
          icon={
            <EmailIcon
              width={24}
              height={24}
              color={theme === "dark" ? "#fff" : "#000"}
            />
          }
        />

        <InputField
          control={control}
          name="password"
          placeholder="Password"
          secureTextEntry
          icon={
            <LockIcon
              width={24}
              height={24}
              color={theme === "dark" ? "#fff" : "#000"}
            />
          }
          error={errors.password}
        />

        <Button
          title="Log In"
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
        <Button
          title="Continue with Google"
          onPress={() => {}}
          loading={loading}
          variant="primary"
          size="md"
        />

        <Text className="text-textMuted text-center mt-5 ">
          Don't have an account?{" "}
          <Link href="/signUp" replace>
            <Text className="text-secondary font-bold">Sign Up</Text>
          </Link>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
