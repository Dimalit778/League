import { Button, InputField, Row, Text } from '@/components';
import AuthLegalConsent from '@/features/auth/components/AuthLegalConsent';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { createLegalAcceptanceContext } from '@/features/auth/legalAcceptance';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, router } from 'expo-router';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import * as yup from 'yup';

const signInSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
});

const signUpSchema = yup.object({
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  password: yup
    .string()
    .min(8, 'At least 8 characters with a letter and a number')
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'At least 8 characters with a letter and a number')
    .required('Password is required'),
});

type FormData = {
  email: string;
  password: string;
};

type AuthMode = 'signIn' | 'signUp';

type Props = {
  mode: AuthMode;
  acceptedLegal: boolean;
  onToggleLegal: () => void;
};

export default function EmailAuthForm({ mode, acceptedLegal, onToggleLegal }: Props) {
  const isSignIn = mode === 'signIn';
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const { signIn, signUp, isLoading, errorMessage, clearError, resendOtp } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(isSignIn ? signInSchema : signUpSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const password = watch('password') ?? '';
  const passwordStrength = [
    password.length > 0,
    password.length >= 8,
    /[A-Za-z]/.test(password) && /\d/.test(password),
    password.length >= 10 && /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const onSubmit = async ({ email, password }: FormData) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (isSignIn) {
      const result = await signIn(normalizedEmail, password);
      if (result.error?.toLowerCase().includes('email not confirmed')) {
        resendOtp(normalizedEmail);
        router.push({ pathname: '/(auth)/verify-email', params: { email: normalizedEmail } });
      }
      return;
    }

    const result = await signUp(normalizedEmail, password, createLegalAcceptanceContext('email', 'sign_up'));
    if (result.success) {
      router.push({ pathname: '/(auth)/verify-email', params: { email: normalizedEmail } });
    }
  };

  const actionLabel = isSignIn ? t('Sign In') : t('Sign Up');

  return (
    <View className="gap-6">
      <View className="gap-3">
        <InputField
          control={control}
          name="email"
          placeholder={t('Email')}
          variant="auth"
          autoComplete="email"
          icon={<Mail size={22} color={colors.muted} strokeWidth={1.5} />}
          error={errors.email}
          clearError={clearError}
        />

        <InputField
          control={control}
          name="password"
          placeholder={t('Password')}
          variant="auth"
          autoComplete={isSignIn ? 'current-password' : 'new-password'}
          textContentType={isSignIn ? 'password' : 'newPassword'}
          secureTextEntry={!showPassword}
          icon={<LockKeyhole size={22} color={colors.muted} strokeWidth={1.5} />}
          error={errors.password}
          onRightIconPress={() => setShowPassword(!showPassword)}
          rightIcon={
            showPassword ? (
              <Eye size={18} color={colors.muted} strokeWidth={2} />
            ) : (
              <EyeOff size={18} color={colors.muted} strokeWidth={2} />
            )
          }
          clearError={clearError}
        />

        {!isSignIn ? (
          <View accessible accessibilityRole="text" accessibilityLabel={t('Password strength')} className="gap-2 px-3">
            <Row keepLtr className="gap-2">
              {[1, 2, 3, 4].map((segment) => (
                <View
                  key={segment}
                  className="h-1.5 flex-1 rounded-full"
                  style={{ backgroundColor: segment <= passwordStrength ? '#FFB31A' : '#33435F' }}
                />
              ))}
            </Row>
          </View>
        ) : null}

        {errorMessage ? (
          <Text accessibilityLiveRegion="assertive" variant="body" size="sm" tone="error" className="text-center">
            {errorMessage}
          </Text>
        ) : null}

        {isSignIn ? (
          <Link href="/(auth)/forgot-password" asChild className="px-2">
            <Text variant="body" size="sm" accessibilityRole="link" tone="info">
              {t('Forgot Password')}
            </Text>
          </Link>
        ) : (
          <AuthLegalConsent accepted={acceptedLegal} onToggle={onToggleLegal} />
        )}
      </View>

      <Button
        label={actionLabel}
        accessibilityLabel={actionLabel}
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={!isValid || isLoading || (!isSignIn && !acceptedLegal)}
        variant="primary"
        size="lg"
        fullWidth
        className="rounded-2xl"
      />
    </View>
  );
}
