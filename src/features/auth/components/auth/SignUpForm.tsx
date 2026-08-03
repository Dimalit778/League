import { EyeClosedIcon, EyeOpenIcon, LockIcon, MailIcon } from '@/assets/icons';
import { Button, Text } from '@/components/ui';
import { InputField } from '@/components/ui/InputField';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { UserIcon } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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

  const {
    control,
    handleSubmit,
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
        autoComplete="name"
        icon={<UserIcon size={24} color={colors.muted} strokeWidth={1.5} />}
        error={errors.fullname}
        clearError={clearError}
      />

      <InputField
        control={control}
        name="email"
        placeholder={t('Email')}
        autoComplete="email"
        icon={<MailIcon size={24} color={colors.muted} />}
        error={errors.email}
        clearError={clearError}
      />

      <InputField
        control={control}
        name="password"
        placeholder={t('Password')}
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

      {errorMessage && (
        <Text className="text-xs text-error text-center">
          {errorMessage}
        </Text>
      )}

      <Button
        label={t('Sign Up')}
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={!isValid || isLoading}
        variant="primary"
        size="lg"
      />
    </>
  );
}
