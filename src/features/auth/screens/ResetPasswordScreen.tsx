import { Button, Text, InputField, Screen } from '@/components/ui';
import {
  parseRecoveryTokensFromUrl,
  updatePasswordWithRecoveryTokens,
  type RecoveryTokens,
} from '@/features/auth/api/authApi';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { spacing } from '@/lib/nativewind/spacing';
import { EyeClosedIcon, EyeOpenIcon, LockIcon } from '@assets/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as yup from 'yup';

type PasswordFormData = yup.InferType<typeof passwordSchema>;

const passwordSchema = yup.object().shape({
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
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

  // The recovery link carries the session tokens in its fragment. Capture them
  // once; the session itself is only established when the user submits.
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
          text: 'OK',
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
    <Screen width="compact" padding="horizontal" edges={['top', 'bottom']}>
      <KeyboardAwareScrollView bottomOffset={62} className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center py-12 sm:py-16">
          <Text variant="display" tone="primary" className="text-center">
            {t('New Password')}
          </Text>
          <Text variant="body" tone="muted" className="mt-4 text-center">
            {t('Enter your new password')}
          </Text>
        </View>

        {linkError && !recoveryTokens ? (
          <View className={spacing.stack}>
            <Text tone="error" className="text-center">
              {t('Reset link is invalid or expired.')}
            </Text>
            <Text tone="muted" className="text-center">
              {t('Please request a new link.')}
            </Text>
            <Button
              title={t('Resend New Link')}
              onPress={() => router.replace('/(auth)/sendResetLink')}
              variant="secondary"
              size="lg"
            />
          </View>
        ) : (
          <View className={spacing.stack}>
            <InputField
              control={passwordForm.control}
              name="password"
              placeholder={t('New Password')}
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

            {errorMessage && (
              <View>
                <Text className="text-error text-center">{errorMessage}</Text>
              </View>
            )}

            <Button
              title={t('Save New Password')}
              onPress={passwordForm.handleSubmit(handleResetPassword)}
              loading={isSubmitting}
              disabled={!passwordForm.formState.isValid || isSubmitting}
              variant="secondary"
              size="lg"
            />
          </View>
        )}
      </KeyboardAwareScrollView>
    </Screen>
  );
};

export default ResetPasswordScreen;
