import { EyeClosedIcon, EyeOpenIcon, LockIcon, MailIcon } from '@/assets/icons';
import { Button, InputField, Text } from '@/components';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
        pathname: '/verifyEmail',
        params: { email },
      });
    }
  };

  return (
    <>
      <InputField
        control={control}
        name="email"
        placeholder={t('Email')}
        variant="auth"
        autoComplete="email"
        secureTextEntry={false}
        error={errors.email}
        icon={<MailIcon size={22} color={colors.muted} />}
        clearError={clearError}
      />

      <InputField
        control={control}
        name="password"
        placeholder={t('Password')}
        variant="auth"
        autoComplete="current-password"
        secureTextEntry={!showPassword}
        icon={<LockIcon size={24} color={colors.muted} />}
        rightIcon={
          showPassword ? (
            <EyeOpenIcon size={18} color={colors.muted} />
          ) : (
            <EyeClosedIcon size={18} color={colors.muted} />
          )
        }
        onRightIconPress={() => setShowPassword(!showPassword)}
        error={errors.password}
        clearError={clearError}
      />

      {errorMessage && <Text className="text-center text-xs text-error">{errorMessage}</Text>}

      <Link href="/sendResetLink" asChild>
        <Text accessibilityRole="link" tone="info">
          {t('Forgot Password')}
        </Text>
      </Link>

      <Button
        accessibilityLabel={t('Sign In')}
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={!isValid || isLoading}
        variant="primary"
        size="lg"
        className="min-h-[58px] rounded-2xl border border-[#FFD566] bg-[#FFB31A] focus:outline-none focus:ring-0"
      >
        <Text className="text-center text-xl font-black text-[#081322]">{t('Sign In')}</Text>
      </Button>
    </>
  );
}
