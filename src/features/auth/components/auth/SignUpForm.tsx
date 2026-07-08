import { Button, Text } from '@/components/ui';
import { InputField } from '@/components/ui/InputField';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { Eye, EyeClosed, LockIcon, Mail, User } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

const signUpSchema = yup.object().shape({
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
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
        icon={<User size={24} color={colors.muted} />}
        error={errors.fullname}
        clearError={clearError}
      />

      <InputField
        control={control}
        name="email"
        placeholder={t('Email')}
        icon={<Mail size={24} color={colors.muted} />}
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
        rightIcon={showPassword ? <Eye size={18} color={colors.muted} /> : <EyeClosed size={18} color={colors.muted} />}
        clearError={clearError}
      />

      {errorMessage && (
        <Text variant="small" className="text-error text-center">
          {errorMessage}
        </Text>
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
}
