import { BackButton, Button, InputField, Screen, Text } from '@/components/ui';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { MailIcon } from '@assets/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as yup from 'yup';

type EmailFormData = yup.InferType<typeof emailSchema>;

const emailSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
});

const SendResetLink = () => {
  const { t } = useTranslation();
  const emailForm = useForm({
    resolver: yupResolver(emailSchema),
    mode: 'onChange',
  });

  const [message, setMessage] = useState<string | null>(null);
  const { colors } = useThemeTokens();
  const { sendResetPasswordLink, isLoading, errorMessage, clearError } = useAuthActions();
  const handleSendResetLink = async (data: EmailFormData) => {
    const result = await sendResetPasswordLink(data.email);

    if (result && result.success) {
      setMessage(t('An email has been sent to your email address with a link to reset your password.'));
    }
  };
  return (
    <Screen edges={['top']}>
      <BackButton />
      <KeyboardAwareScrollView
        bottomOffset={62}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View className="items-center py-16">
          <Text className="text-secondary text-4xl font-bold text-center">{t('Reset Password')}</Text>
          <Text className="text-muted text-base text-center mt-4">
            {t("Enter your email address and we'll send you a reset link")}
          </Text>
        </View>

        <View className="px-5 gap-4">
          <InputField
            control={emailForm.control}
            name="email"
            placeholder="Email"
            secureTextEntry={false}
            error={emailForm.formState.errors.email}
            icon={<MailIcon size={24} color={colors.muted} />}
            clearError={clearError}
          />

          <Button
            title={t('Send Reset Link')}
            onPress={emailForm.handleSubmit(handleSendResetLink)}
            loading={isLoading}
            disabled={!emailForm.formState.isValid || isLoading}
            variant="secondary"
            size="lg"
          />
          {errorMessage ||
            (message && (
              <View className="mt-4">
                <Text className={`text-center ${errorMessage ? 'text-error' : 'text-success'}`}>
                  {errorMessage || message}
                </Text>
              </View>
            ))}
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
};

export default SendResetLink;
