import { EyeClosedIcon, EyeOpenIcon, LockIcon, MailIcon } from '@/assets/icons';
import { Button, InputField, Row, Text } from '@/components';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, router } from 'expo-router';
import { Check, UserIcon } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import * as yup from 'yup';
const signUpSchema = yup.object().shape({
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Minimum 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Password must contain at least one letter and one number')
    .required('Password is required'),
  fullname: yup.string().required('Full name is required').min(3, 'Full name must be at least 3 characters'),
});

type SignUpFormData = yup.InferType<typeof signUpSchema>;

export default function SignUpForm() {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const { signUp, isLoading, errorMessage, clearError } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      fullname: '',
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
    const fullname = form.fullname.trim().replace(/\s+/g, ' ');

    const result = await signUp(email, password, fullname);

    if (result.success) {
      router.push({
        pathname: '/(auth)/verify-email',
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
        variant="auth"
        autoComplete="name"
        icon={<UserIcon size={24} color={colors.muted} strokeWidth={1.5} />}
        error={errors.fullname}
        clearError={clearError}
      />

      <InputField
        control={control}
        name="email"
        placeholder={t('Email')}
        variant="auth"
        autoComplete="email"
        icon={<MailIcon size={24} color={colors.muted} />}
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

      <View accessible accessibilityRole="text" accessibilityLabel={t('Password strength')} className="gap-2">
        <Row keepLtr className="gap-2">
          {[1, 2, 3, 4].map((segment) => (
            <View
              key={segment}
              className="h-1.5 flex-1 rounded-full"
              style={{ backgroundColor: segment <= passwordStrength ? '#FFB31A' : '#33435F' }}
            />
          ))}
        </Row>
        <Text variant="bodySmall" tone="muted" className="text-start">
          {passwordStrength >= 4 ? t('Strong password') : t('At least 8 characters with a letter and a number')}
        </Text>
      </View>
      {errorMessage && (
        <Text variant="bodySmall" tone="error" className="text-center">
          {errorMessage}
        </Text>
      )}

      <Row className="mt-6 gap-2.5 ">
        <Pressable
          onPress={() => setAcceptedTerms((accepted) => !accepted)}
          accessibilityRole="checkbox"
          accessibilityLabel={t('I agree to the')}
          accessibilityState={{ checked: acceptedTerms }}
        >
          <View
            className="size-7 rounded-md border"
            style={{ borderColor: colors.primary, backgroundColor: acceptedTerms ? colors.primary : 'transparent' }}
          >
            {acceptedTerms ? <Check size={20} color={colors.onPrimary} strokeWidth={3} /> : null}
          </View>
        </Pressable>
        <Row className="gap-1">
          <Text variant="bodySmall" tone="muted">
            {t('I agree to the')}
          </Text>
          <Link href="/(auth)/terms" asChild accessibilityRole="link">
            <Text variant="bodySmall" tone="info" accessibilityRole="link" className="underline">
              {t('Terms of Service')}
            </Text>
          </Link>
        </Row>
      </Row>

      <Button
        label={t('Sign Up')}
        accessibilityLabel={t('Sign Up')}
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={!isValid || !acceptedTerms || isLoading}
        variant="primary"
        size="lg"
        fullWidth
        className="rounded-2xl"
      />
    </>
  );
}
