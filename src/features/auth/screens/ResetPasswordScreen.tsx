import { Button, InputField, Text } from '@/components';
import {
  parseRecoveryTokensFromUrl,
  updatePasswordWithRecoveryTokens,
  type RecoveryTokens,
} from '@/features/auth/api/authApi';
import AuthLegalLinks from '@/features/auth/components/AuthLegalLinks';
import AuthScaffold from '@/features/auth/components/auth/AuthScaffold';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { EyeClosedIcon, EyeOpenIcon, LockIcon } from '@assets/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { LockKeyhole } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, View } from 'react-native';
import * as yup from 'yup';

type PasswordFormData = yup.InferType<typeof passwordSchema>;

const passwordSchema = yup.object().shape({
  password: yup
    .string()
    .min(8, 'Minimum 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Password must contain at least one letter and one number')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

const ResetPasswordScreen = () => {
  const { colors } = useThemeTokens();
  const url = Linking.useLinkingURL();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recoveryTokens, setRecoveryTokens] = useState<RecoveryTokens | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordForm = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!url || recoveryTokens) return;

    const { tokens, error } = parseRecoveryTokensFromUrl(url);
    if (tokens) {
      setRecoveryTokens(tokens);
      setLinkError(null);
    } else if (error) {
      setLinkError(error);
    }
  }, [url, recoveryTokens]);

  const handleResetPassword = async (data: PasswordFormData) => {
    if (!recoveryTokens) {
      setErrorMessage(linkError ?? t('Reset link is invalid or expired.'));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await updatePasswordWithRecoveryTokens(data.password, recoveryTokens);

      if (!result.success) {
        setErrorMessage(result.error ?? t('Failed to update password. Please try again.'));
        return;
      }

      Alert.alert(t('Password Updated'), t('Your password has been changed successfully.'), [
        {
          text: t('OK'),
          onPress: () => router.replace('/(auth)/signIn'),
        },
      ]);
    } catch (error) {
      console.error('Reset password failed:', error);
      setErrorMessage('Failed to update password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const emblem = (
    <View className="size-[72px] items-center justify-center rounded-[22px] border border-[#FFCC65]/45 bg-[#0B213B]/90">
      <LockKeyhole size={34} color="#FFB31A" strokeWidth={1.8} />
    </View>
  );

  return (
    <AuthScaffold
      title={t('New Password')}
      description={t('Enter your new password')}
      fallbackHref="/(auth)/signIn"
      emblem={emblem}
      footer={<AuthLegalLinks />}
    >
      {linkError && !recoveryTokens ? (
        <View className="gap-4">
          <View className="rounded-2xl border border-error/30 bg-error/10 p-4">
            <Text tone="error" className="text-center">
              {t('Reset link is invalid or expired.')}
            </Text>
            <Text tone="muted" className="mt-1 text-center">
              {t('Please request a new link.')}
            </Text>
          </View>
          <Button
            label={t('Resend New Link')}
            onPress={() => router.replace('/(auth)/forgot-password')}
            variant="primary"
            size="lg"
            fullWidth
            className="rounded-2xl"
          />
        </View>
      ) : (
        <View className="gap-4">
          <InputField
            control={passwordForm.control}
            name="password"
            placeholder={t('New Password')}
            variant="auth"
            autoComplete="new-password"
            textContentType="newPassword"
            secureTextEntry={!showPassword}
            error={passwordForm.formState.errors.password}
            icon={<LockIcon size={24} color={colors.muted} />}
            rightIcon={
              showPassword ? (
                <EyeOpenIcon size={24} color={colors.muted} />
              ) : (
                <EyeClosedIcon size={24} color={colors.muted} />
              )
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <InputField
            control={passwordForm.control}
            name="confirmPassword"
            placeholder={t('Confirm Password')}
            variant="auth"
            autoComplete="new-password"
            textContentType="newPassword"
            secureTextEntry={!showConfirmPassword}
            error={passwordForm.formState.errors.confirmPassword}
            icon={<LockIcon size={24} color={colors.muted} />}
            rightIcon={
              showConfirmPassword ? (
                <EyeOpenIcon size={24} color={colors.muted} />
              ) : (
                <EyeClosedIcon size={24} color={colors.muted} />
              )
            }
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          {errorMessage ? (
            <Text accessibilityLiveRegion="assertive" className="text-center text-sm text-error">
              {errorMessage}
            </Text>
          ) : null}

          <Button
            label={t('Save New Password')}
            onPress={passwordForm.handleSubmit(handleResetPassword)}
            loading={isSubmitting}
            disabled={!passwordForm.formState.isValid || isSubmitting}
            variant="primary"
            size="lg"
            fullWidth
            className="rounded-2xl"
          />
        </View>
      )}
    </AuthScaffold>
  );
};

export default ResetPasswordScreen;
