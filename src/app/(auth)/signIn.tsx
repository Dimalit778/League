import { Screen } from '@/components/layout';
import { Button, InputField } from '@/components/ui';

import GoogleAuth from '@/components/GoogleAuth';
import { useAuth } from '@/services/useAuth';
import { useThemeStore } from '@/store/ThemeStore';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Text, View } from 'react-native';
import * as yup from 'yup';
import { EmailIcon, LockIcon } from '../../../assets/icons';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Minimum 6 characters')
    .required('Password is required'),
});

type FormData = yup.InferType<typeof schema>;

const SignIn = () => {
  const { theme } = useThemeStore();
  const { signIn, signInWithGoogle, isLoading, errorMessage, clearError } =
    useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    try {
      await signIn(data.email, data.password);
    } catch (error: any) {
      Alert.alert('Error', errorMessage || 'An unexpected error occurred');
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Google Sign In', error?.message || 'Sign in failed');
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView className="flex-1 bg-background">
        {/* Header */}
        <View className="items-center p-5">
          <Text className="text-h1 text-secondary font-headBold">
            Welcome Back
          </Text>

          <Text className="text-muted font-semibold mb-5">
            Sign in to your account
          </Text>
        </View>
        {/* Form */}
        <View className="flex-1 mt-10 px-5 gap-4">
          <InputField
            control={control}
            name="email"
            placeholder="Email"
            secureTextEntry={false}
            error={errors.email}
            icon={<EmailIcon size={24} color={theme} />}
            clearError={clearError}
          />

          <InputField
            control={control}
            name="password"
            placeholder="Password"
            secureTextEntry
            icon={<LockIcon size={24} color={theme} />}
            error={errors.password}
            clearError={clearError}
          />

          {errorMessage && (
            <View className="p-3 mb-4">
              <Text className="text-error text-center">{errorMessage}</Text>
            </View>
          )}

          <Button
            title="Log In"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={!isValid || isLoading}
            variant="primary"
            size="lg"
          />
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-gray-600" />
            <Text className="text-gray-400 mx-2">OR</Text>
            <View className="flex-1 h-px bg-gray-600" />
          </View>
          {/* <Button
            title="Continue with Google"
            onPress={handleGoogleSignIn}
            loading={isLoading}
            variant="border"
            size="md"
          /> */}
          <GoogleAuth />

          <Text className="text-muted text-center mt-5 ">
            Don't have an account?{' '}
            <Link href="/signUp" replace>
              <Text className="text-secondary font-bold">Sign Up</Text>
            </Link>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

export default SignIn;
