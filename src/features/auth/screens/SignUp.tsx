import { BackButton, Button, InputField, Screen } from '@/components/ui';

import GoogleAuth from '@/features/auth/components/GoogleAuth';
import { useAuthActions } from '@/features/auth/queries/useAuthActions';
import { useThemeTokens } from '@/features/settings/hooks/useThemeTokens';
import { EmailIcon, LockIcon, UserIcon } from '@assets/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
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
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
  fullname: yup.string().required('Full name is required').min(3, 'Full name must be at least 3 characters'),
});
type FormData = yup.InferType<typeof schema>;

const SignUp = () => {
  const { signUp, isLoading, isError, errorMessage } = useAuthActions();
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
    const { success, error } = await signUp(data.email.trim(), data.password, data.fullname);
    if (!success) {
      console.error('Sign up error:', error);
    }
  };

  return (
    <Screen>
      <BackButton />
      <KeyboardAwareScrollView bottomOffset={62} className="flex-1">
        <View className="items-center py-16">
          <Text className=" text-secondary font-nunito-black text-center " style={{ fontSize: 42 }}>
            Create account
          </Text>
          <Text className="text-center text-muted font-nunito-bold ">Sign up to get started</Text>
        </View>

        <View className=" px-5 gap-4">
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
          {errorMessage && (
            <View className="">
              <Text className="text-error text-center">{errorMessage}</Text>
            </View>
          )}

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
          <GoogleAuth />
          <View className="flex-row items-center justify-center mt-5 gap-2 ">
            <Text className="text-muted text-center  ">Already have an account?</Text>
            <Link href="/signIn" replace>
              <Text className=" text-secondary font-bold">Sign In</Text>
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
};

export default SignUp;
