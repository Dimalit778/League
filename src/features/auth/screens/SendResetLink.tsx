import { LoadingOverlay } from '@/components/layout';
import { BackButton, Button, InputField, Screen } from '@/components/ui';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useThemeTokens } from '@/features/settings/hooks/useThemeTokens';
import { EmailIcon } from '@assets/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as yup from 'yup';

type EmailFormData = yup.InferType<typeof emailSchema>;

const emailSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
});

const SendResetLink = () => {
  const emailForm = useForm({
    resolver: yupResolver(emailSchema),
    mode: 'onChange',
  });
  const [isProcessingLink, setIsProcessingLink] = useState(false);
  const { colors } = useThemeTokens();
  const { sendResetPasswordLink, isLoading, errorMessage, clearError } = useAuthActions();
  const handleSendResetLink = async (data: EmailFormData) => {
    const result = await sendResetPasswordLink(data.email);

    if (result && result.success) {
      // Email sent successfully - user needs to check their email
      // The email link will redirect them back to this screen with URL params
    }
  };
  return (
    <Screen>
      {(isLoading || isProcessingLink) && <LoadingOverlay />}
      <BackButton />
      <KeyboardAwareScrollView bottomOffset={62} className="flex-1">
        <View className="items-center py-16">
          <Text className="text-secondary font-nunito-black text-center" style={{ fontSize: 42 }}>
            Reset Password
          </Text>
          <Text className="text-muted font-nunito-bold text-center mt-2">
            Enter your email address and we'll send you a reset link
          </Text>
        </View>

        <View className="px-5 gap-4">
          <InputField
            control={emailForm.control}
            name="email"
            placeholder="Email"
            secureTextEntry={false}
            error={emailForm.formState.errors.email}
            icon={<EmailIcon size={24} color={colors.muted} />}
            clearError={clearError}
          />

          {errorMessage && (
            <View className="">
              <Text className="text-error text-center">{errorMessage}</Text>
            </View>
          )}

          <Button
            title="Send Reset Link"
            onPress={emailForm.handleSubmit(handleSendResetLink)}
            loading={isLoading}
            disabled={!emailForm.formState.isValid || isLoading}
            variant="secondary"
            size="lg"
          />

          <View className="flex-row items-center justify-center mt-5">
            <Link href="/(auth)/signIn" replace>
              <Text className="text-secondary font-bold">Back to Sign In</Text>
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
};

export default SendResetLink;
