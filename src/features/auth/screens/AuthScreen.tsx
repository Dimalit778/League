import { Button, CText, InputField } from '@/components/ui';
import AppleAuth from '@/features/auth/components/AppleAuth';
import AuthLegalLinks from '@/features/auth/components/AuthLegalLinks';
import GoogleAuth from '@/features/auth/components/GoogleAuth';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativeWind';
import { EmailIcon, EyeClosedIcon, EyeOpenIcon, LockIcon, UserIcon } from '@assets/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as yup from 'yup';

type AuthMode = 'signIn' | 'signUp';

type AuthScreenProps = {
  initialMode?: AuthMode;
};

const signInSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
});

const signUpSchema = yup.object().shape({
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
  fullname: yup.string().required('Full name is required').min(3, 'Full name must be at least 3 characters'),
});

type SignInFormData = yup.InferType<typeof signInSchema>;
type SignUpFormData = yup.InferType<typeof signUpSchema>;

const AuthModeToggle = ({ mode, onModeChange }: { mode: AuthMode; onModeChange: (mode: AuthMode) => void }) => {
  const { t } = useTranslation();

  const options = [
    { key: 'signIn', label: t('Sign In') },
    { key: 'signUp', label: t('Sign Up') },
  ] as const;

  return (
    <View className=" rounded-2xl border border-border  p-1">
      <View className="flex-row">
        {options.map((option) => {
          const active = mode === option.key;

          return (
            <Pressable
              key={option.key}
              onPress={() => onModeChange(option.key)}
              className={cn('flex-1 items-center justify-center rounded-xl py-2', active && 'bg-secondary')}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <CText variant="bodyBold" className={cn('text-center', active ? 'text-white' : 'text-muted')}>
                {option.label}
              </CText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const SignInForm = () => {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const { signIn, isLoading, errorMessage, clearError, resendOtp } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(signInSchema),
    mode: 'onChange',
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

      <Link href="/sendResetLink" asChild>
        <CText variant="caption" className="text-secondary text-center">
          {t('Forgot Password')}
        </CText>
      </Link>
    </>
  );
};

const SignUpForm = () => {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const { signUp, isLoading, errorMessage, clearError } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(signUpSchema),
    mode: 'onChange',
  });

  const onSubmit = async (form: SignUpFormData) => {
    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const fullname = form.fullname.trim().replace(/\s+/g, ' ');

    const result = await signUp(email, password, fullname);

    if (result.success) {
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
        name="fullname"
        placeholder={t('Full Name')}
        icon={<UserIcon size={24} color={colors.muted} />}
        error={errors.fullname}
        clearError={clearError}
      />

      <InputField
        control={control}
        name="email"
        placeholder={t('Email')}
        icon={<EmailIcon size={24} color={colors.muted} />}
        error={errors.email}
        clearError={clearError}
      />

      <InputField
        control={control}
        name="password"
        placeholder={t('Password')}
        secureTextEntry={!showPassword}
        icon={<LockIcon size={24} color={colors.muted} />}
        error={errors.password}
        onRightIconPress={() => setShowPassword(!showPassword)}
        rightIcon={
          showPassword ? (
            <EyeOpenIcon size={18} color={colors.muted} />
          ) : (
            <EyeClosedIcon size={18} color={colors.muted} />
          )
        }
        clearError={clearError}
      />

      {errorMessage && (
        <CText variant="small" className="text-error text-center">
          {errorMessage}
        </CText>
      )}

      <Button
        title={t('Sign Up')}
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={!isValid || isLoading}
        variant="secondary"
        size="lg"
      />
    </>
  );
};

export default function AuthScreen({ initialMode = 'signIn' }: AuthScreenProps) {
  const { t } = useTranslation();
  const { clearError } = useAuthActions();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const handleModeChange = (nextMode: AuthMode) => {
    if (nextMode === mode) return;
    clearError();
    setMode(nextMode);
  };

  const isSignIn = mode === 'signIn';

  return (
    <>
      <KeyboardAwareScrollView bottomOffset={62} className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center ">
          <CText variant="hero" className="text-text">
            {isSignIn ? t('Welcome Back') : t('Create account')}
          </CText>
          <CText variant="body" className="text-muted">
            {isSignIn ? t('Sign in to your account') : t('Sign up to get started')}
          </CText>
        </View>
        <View className="flex-1 rounded-[28px] border border-border bg-white/[0.06] p-5">
          <AuthModeToggle mode={mode} onModeChange={handleModeChange} />

          <View className="mt-6 gap-4 px-5">
            {isSignIn ? <SignInForm key="signIn" /> : <SignUpForm key="signUp" />}

            <View className="my-2 flex-row items-center">
              <View className="h-px flex-1 bg-gray-600" />
              <CText variant="caption" className="mx-2 text-gray-400">
                {t('OR')}
              </CText>
              <View className="h-px flex-1 bg-gray-600" />
            </View>

            <View className="gap-3">
              <AppleAuth isLoading={isAppleLoading} setIsLoading={setIsAppleLoading} mode={mode} />
              <GoogleAuth isLoading={isGoogleLoading} setIsLoading={setIsGoogleLoading} />
            </View>

            <AuthLegalLinks />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </>
  );
}
