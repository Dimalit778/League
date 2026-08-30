import { images } from '@/assets/images';
import { Button, InputField, MyImage, Row, Text } from '@/components';
import {
  parseRecoveryTokensFromUrl,
  updatePasswordWithRecoveryTokens,
  type RecoveryTokens,
} from '@/features/auth/api/authApi';
import AuthScaffold from '@/features/auth/components/auth/AuthScaffold';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react-native';
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
  const password = passwordForm.watch('password') ?? '';
  const passwordStrength = [
    password.length > 0,
    password.length >= 8,
    /[A-Za-z]/.test(password) && /\d/.test(password),
    password.length >= 10 && /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

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

  return (
    <AuthScaffold
      title={t('New Password')}
      fallbackHref="/(auth)/signIn"
      emblem={<MyImage source={images.passwordLogo} width={140} height={140} contentFit="contain" />}
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
            icon={<LockKeyhole size={24} color={colors.muted} />}
            rightIcon={
              showPassword ? <Eye size={24} color={colors.muted} /> : <EyeOff size={24} color={colors.muted} />
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
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

          <InputField
            control={passwordForm.control}
            name="confirmPassword"
            placeholder={t('Confirm Password')}
            variant="auth"
            autoComplete="new-password"
            textContentType="newPassword"
            secureTextEntry={!showConfirmPassword}
            error={passwordForm.formState.errors.confirmPassword}
            icon={<LockKeyhole size={24} color={colors.muted} />}
            rightIcon={
              showConfirmPassword ? <Eye size={24} color={colors.muted} /> : <EyeOff size={24} color={colors.muted} />
            }
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          {errorMessage ? (
            <Text accessibilityLiveRegion="assertive" className="text-center text-sm text-error">
              {errorMessage}
            </Text>
          ) : null}

          <View className="pt-4">
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
        </View>
      )}
    </AuthScaffold>
  );
};

export default ResetPasswordScreen;
