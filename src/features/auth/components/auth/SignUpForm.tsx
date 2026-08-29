import { Button, InputField, Row, Text } from '@/components';
import AuthLegalConsent from '@/features/auth/components/AuthLegalConsent';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { createLegalAcceptanceContext } from '@/features/auth/legalAcceptance';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import * as yup from 'yup';
const signUpSchema = yup.object().shape({
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  password: yup
    .string()
    .min(8, 'At least 8 characters with a letter and a number')
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'At least 8 characters with a letter and a number')
    .required('Password is required'),
});

type SignUpFormData = yup.InferType<typeof signUpSchema>;

type Props = {
  acceptedLegal: boolean;
  onToggleLegal: () => void;
};

export default function SignUpForm({ acceptedLegal, onToggleLegal }: Props) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const { signUp, isLoading, errorMessage, clearError } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
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

  const onSubmit = async (form: SignUpFormData) => {
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    const result = await signUp(email, password, createLegalAcceptanceContext('email', 'sign_up'));

    if (result.success) {
      router.push({
        pathname: '/(auth)/verify-email',
        params: { email },
      });
    }
  };

  return (
    <View className="gap-8 ">
      <View className="items-center h-10">
        <Text accessibilityRole="header" variant="header" className="text-center">
          {t('Create your account')}
        </Text>
      </View>
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
          autoComplete="new-password"
          textContentType="newPassword"
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
        {errorMessage && (
          <Text variant="bodySmall" tone="error" className="text-center">
            {errorMessage}
          </Text>
        )}
        <AuthLegalConsent accepted={acceptedLegal} onToggle={onToggleLegal} />
      </View>

      <View className="">
        <Button
          label={t('Sign Up')}
          accessibilityLabel={t('Sign Up')}
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={!isValid || !acceptedLegal || isLoading}
          variant="primary"
          size="lg"
          fullWidth
          className="rounded-2xl"
        />
      </View>
    </View>
  );
}
