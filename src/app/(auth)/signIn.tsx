import GoogleAuth from '@/components/GoogleAuth';
import { BackButton, Button, InputField, Screen } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useAuth } from '@/services/useAuth';
import logo from '@assets/app-icon.png';
import { EmailIcon, LockIcon } from '@assets/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Image, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as yup from 'yup';

type FormData = yup.InferType<typeof schema>;

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Minimum 6 characters')
    .required('Password is required'),
});

const SignIn = () => {
  const { colors } = useThemeTokens();
  const { signIn, isLoading, errorMessage, clearError } = useAuth();

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

  return (
    <Screen>
      <BackButton />
      <KeyboardAwareScrollView bottomOffset={62} className="flex-1 ">
        <View className="items-center justify-center ">
          <Image source={logo} resizeMode="contain" className="w-40  h-40" />
        </View>
        <View className="items-center p-5">
          <Text className="text-h1 text-secondary font-headBold">
            Welcome Back
          </Text>

          <Text className="text-muted font-semibold ">
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
            icon={<EmailIcon size={24} color={colors.muted} />}
            clearError={clearError}
          />

          <InputField
            control={control}
            name="password"
            placeholder="Password"
            secureTextEntry
            icon={<LockIcon size={24} color={colors.muted} />}
            error={errors.password}
            clearError={clearError}
          />

          {errorMessage && (
            <View className="">
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

          <GoogleAuth />

          <Text className="text-muted text-center mt-5 ">
            Don't have an account?
            <Link href="/signUp" replace>
              <Text className="text-secondary font-bold">Sign Up</Text>
            </Link>
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
};

export default SignIn;
