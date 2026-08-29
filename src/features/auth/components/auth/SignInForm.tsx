import { Button, InputField, Text } from '@/components';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, router } from 'expo-router';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import * as yup from 'yup';
const signInSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
});

type SignInFormData = yup.InferType<typeof signInSchema>;
export default function SignInForm() {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const { signIn, isLoading, errorMessage, clearError, resendOtp } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignInFormData>({
    resolver: yupResolver(signInSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    const email = data.email.trim().toLowerCase();
    const password = data.password;

    const result = await signIn(email, password);

    if (result.error && result.error?.toLowerCase().includes('email not confirmed')) {
      resendOtp(email);
      router.push({
        pathname: '/(auth)/verify-email',
        params: { email },
      });
    }
  };

  return (
    <View className="gap-8">
      <Text accessibilityRole="header" variant="header" className="text-center">
        {t('Welcome Back')}
      </Text>
      <View className="gap-3">
        <InputField
          control={control}
          name="email"
          placeholder={t('Email')}
          variant="auth"
          autoComplete="email"
          secureTextEntry={false}
          error={errors.email}
          icon={<Mail size={22} color={colors.muted} strokeWidth={1.5} />}
          clearError={clearError}
        />

        <InputField
          control={control}
          name="password"
          placeholder={t('Password')}
          variant="auth"
          autoComplete="current-password"
          secureTextEntry={!showPassword}
          icon={<LockKeyhole size={22} color={colors.muted} strokeWidth={1.5} />}
          rightIcon={
            showPassword ? (
              <Eye size={18} color={colors.muted} strokeWidth={2} />
            ) : (
              <EyeOff size={18} color={colors.muted} strokeWidth={2} />
            )
          }
          onRightIconPress={() => setShowPassword(!showPassword)}
          error={errors.password}
          clearError={clearError}
        />

        {errorMessage ? (
          <Text accessibilityLiveRegion="assertive" className="text-center text-sm text-error">
            {errorMessage}
          </Text>
        ) : null}
        <Link href="/(auth)/forgot-password" asChild className="px-2">
          <Text variant="bodySmall" accessibilityRole="link" tone="info">
            {t('Forgot Password')}
          </Text>
        </Link>
      </View>
      <View className="">
        <Button
          label={t('Sign In')}
          accessibilityLabel={t('Sign In')}
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={!isValid || isLoading}
          variant="primary"
          size="lg"
          fullWidth
          className="rounded-2xl"
        />
      </View>
    </View>
  );
}
