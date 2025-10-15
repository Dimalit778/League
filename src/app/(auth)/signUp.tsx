import { Button, InputField } from '@/components/ui';

// import GoogleAuth from '@/components/GoogleAuth';
import BackButton from '@/components/ui/BackButton';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useAuth } from '@/services/useAuth';

import { EmailIcon, LockIcon, UserIcon } from '@assets/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const schema = yup.object().shape({
  email: yup
    .string()
    .test('email', 'Invalid email', (value) => validateEmail(value || ''))
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Minimum 6 characters')
    .required('Password is required'),
  fullname: yup
    .string()
    .required('Full name is required')
    .min(3, 'Full name must be at least 3 characters'),
});
type FormData = yup.InferType<typeof schema>;

const SignUp = () => {
  const { signUp, isLoading, errorMessage } = useAuth();
  const { colors } = useThemeTokens();
  const [showPassword, setShowPassword] = useState(false);
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
      await signUp(data.email.trim(), data.password, data.fullname);
    } catch (error: any) {
      Alert.alert('Error', errorMessage || 'An unexpected error occurred');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView className="flex-1 ">
        <BackButton />
        <View className="items-center p-5 ">
          <Text className="text-h1 text-secondary font-headBold text-center mb-5">
            Create an account
          </Text>
          <Text className="text-center text-muted font-semibold mb-5">
            Sign up to get started
          </Text>
        </View>
        <View className=" mt-10 px-5 gap-4">
          <InputField
            control={control}
            name="fullname"
            placeholder="Full Name"
            icon={<UserIcon size={24} color={colors.muted} />}
            error={errors.fullname}
          />

          <InputField
            control={control}
            name="email"
            placeholder="Email"
            icon={<EmailIcon size={24} color={colors.muted} />}
            error={errors.email}
          />
          <InputField
            control={control}
            name="password"
            placeholder="Password"
            secureTextEntry={!showPassword}
            icon={<LockIcon size={24} color={colors.muted} />}
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
          {/* <GoogleAuth /> */}
          <View className="flex-row items-center justify-center mt-5 gap-2 ">
            <Text className="text-muted text-center  ">
              Already have an account?
            </Text>
            <Link href="/signIn" replace>
              <Text className=" text-secondary font-bold">Sign In</Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
