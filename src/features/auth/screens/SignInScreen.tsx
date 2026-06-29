import { BackButton, Button, CText, InputField, Screen } from '@/components/ui';
import AppleAuth from '@/features/auth/components/AppleAuth';
import AuthLegalLinks from '@/features/auth/components/AuthLegalLinks';
import GoogleAuth from '@/features/auth/components/GoogleAuth';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
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
  const { t } = useTranslation();
  const { signIn, isLoading, errorMessage, clearError, resendOtp } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    const email = data.email.trim().toLowerCase();
    const password = data.password;

    const result = await signIn(email, password);

    if (result.error && result.error?.toLowerCase().includes('email not confirmed')) {
      resendOtp(email);
      router.push({
        pathname: '/verifyEmail',
        params: { email },
      });
    }
  };

  return (
    <Screen withSafeArea>
      <BackButton />
      <KeyboardAwareScrollView bottomOffset={62} className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center py-16">
          <CText variant="hero" className="text-secondary">
            {t('Welcome Back')}
          </CText>

          <CText variant="body" className="text-muted ">
            {t('Sign in to your account')}
          </CText>
        </View>

        {/* Form */}
        <View className="px-5 gap-4">
          <InputField
            control={control}
            name="email"
            placeholder={t('Email')}
            secureTextEntry={false}
            error={errors.email}
            icon={<EmailIcon size={24} color={colors.muted} />}
            clearError={clearError}
          />

          <InputField
            control={control}
            name="password"
            placeholder={t('Password')}
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
            <CText variant="small" className="text-error text-center">
              {errorMessage}
            </CText>
          )}

          <Button
            title={t('Sign In')}
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={!isValid || isLoading}
            variant="secondary"
            size="lg"
            className="focus:outline-none focus:ring-0"
          />
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-gray-600" />
            <CText variant="caption" className="text-gray-400 mx-2">
              {t('OR')}
            </CText>
            <View className="flex-1 h-px bg-gray-600" />
          </View>

          <View className="gap-3">
            <AppleAuth isLoading={isAppleLoading} setIsLoading={setIsAppleLoading} mode="signIn" />
            <GoogleAuth isLoading={isGoogleLoading} setIsLoading={setIsGoogleLoading} />
          </View>
          <View className="px-5 mt-5 gap-4 ">
            <View className="flex-row items-center justify-center gap-2">
              <CText variant="caption" className="text-muted text-center">
                {t("Don't have an account?")}
              </CText>
              <Link href="/signUp" replace>
                <CText variant="caption" className="text-secondary ">
                  {t('Sign Up')}
                </CText>
              </Link>
            </View>
            <Link href="/sendResetLink" asChild>
              <CText variant="caption" className="text-secondary text-center mt-5 ">
                {t('Forgot Password')}
              </CText>
            </Link>
            <AuthLegalLinks />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
};

export default SignInScreen;
