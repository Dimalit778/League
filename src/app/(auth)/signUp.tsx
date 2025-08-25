import { Button, InputField } from '@/components/ui';

import { useAuth } from '@/services/useAuth';
import { useThemeStore } from '@/store/ThemeStore';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from 'react-native';
import * as yup from 'yup';
import { EmailIcon, LockIcon, UserIcon } from '../../../assets/icons';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Minimum 6 characters')
    .required('Password is required'),
  fullname: yup
    .string()
    .required('Full name is required')
    .min(3, 'Full name must be at least 3 characters'),
});

export default function SignUpScreen() {
  const { signUp, isLoading, errorMessage } = useAuth();
  const { theme } = useThemeStore();
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: any) => {
    try {
      const result = await signUp(
        data.email.trim(),
        data.password,
        data.fullname
      );

      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to sign up');
      }
    } catch (error: any) {
      Alert.alert('Error', errorMessage || 'An unexpected error occurred');
    }
  };
  const handleGoogleSignIn = async () => {};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background  px-5"
    >
      <View className="py-10">
        <Text className="text-4xl text-primary font-bold text-center mb-5">
          Create an account
        </Text>
        <Text className="text-center text-textMuted font-semibold mb-5">
          Sign up to get started
        </Text>
      </View>
      <View className="flex-1 mt-10">
        <InputField
          control={control}
          name="fullname"
          placeholder="Full Name"
          icon={<UserIcon size={24} color={theme} />}
          error={errors.fullname}
        />

        <InputField
          control={control}
          name="email"
          placeholder="Email"
          icon={<EmailIcon size={24} color={theme} />}
          error={errors.email}
        />
        <InputField
          control={control}
          name="password"
          placeholder="Password"
          secureTextEntry={!showPassword}
          icon={<LockIcon size={24} color={theme} />}
          error={errors.password}
        />

        <Button
          title="Sign Up"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={!isValid || isLoading}
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
          loading={isLoading}
          variant="primary"
          size="md"
        />
        <View className="flex-row items-center justify-center mt-5 gap-2 ">
          <Text className="text-textMuted text-center  ">
            Already have an account?
          </Text>
          <Link href="/signIn" replace>
            <Text className=" text-secondary font-bold">Sign In</Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
