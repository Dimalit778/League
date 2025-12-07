import { LoadingOverlay } from '@/components/layout';
import { BackButton, Button, CText, InputField, Screen } from '@/components/ui';
import GoogleAuth from '@/features/auth/components/GoogleAuth';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { EmailIcon, EyeClosedIcon, EyeOpenIcon, LockIcon } from '@assets/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as yup from 'yup';

type FormData = yup.InferType<typeof schema>;

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
});

const SignInScreen = () => {
  const { colors } = useThemeTokens();
  const { signIn, isLoading, errorMessage, clearError, resendOtp } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    const result = await signIn(data.email, data.password);

    if (result.error && result.error.includes('Email not confirmed')) {
      resendOtp(data.email);
      router.push({
        pathname: '/verifyEmail',
        params: { email: data.email },
      });
    }
  };

  return (
    <Screen>
      {(isLoading || isGoogleLoading) && <LoadingOverlay />}
      <BackButton />
      <KeyboardAwareScrollView bottomOffset={62} className="flex-1">
        <View className="items-center py-16">
          <CText className=" text-secondary font-nunito-black text-center" style={{ fontSize: 42 }}>
            Welcome Back
          </CText>

          <CText className="text-muted font-nunito-bold ">Sign in to your account</CText>
        </View>

        {/* Form */}
        <View className=" px-5 gap-4">
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
            secureTextEntry={!showPassword}
            icon={<LockIcon size={24} color={colors.muted} />}
            rightIcon={
              showPassword ? (
                <EyeOpenIcon size={24} color={colors.muted} />
              ) : (
                <EyeClosedIcon size={24} color={colors.muted} />
              )
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
            error={errors.password}
            clearError={clearError}
          />

          {errorMessage && (
            <View className="">
              <CText className="text-error text-center">{errorMessage}</CText>
            </View>
          )}

          <Button
            title="Log In"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={!isValid || isLoading}
            variant="secondary"
            size="lg"
          />
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-gray-600" />
            <CText className="text-gray-400 mx-2">OR</CText>
            <View className="flex-1 h-px bg-gray-600" />
          </View>

          <GoogleAuth isLoading={isGoogleLoading} setIsLoading={setIsGoogleLoading} />
          <View className="px-5 mt-5 gap-4 ">
            <View className="flex-row items-center justify-center gap-2">
              <CText className="text-muted text-center">Don't have an account?</CText>
              <Link href="/signUp" replace>
                <CText className="text-secondary font-bold">Sign Up</CText>
              </Link>
            </View>
            <Link href="/sendResetLink" asChild>
              <CText className="text-secondary font-bold text-center mt-5 ">Forgot Password</CText>
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
};

export default SignInScreen;
