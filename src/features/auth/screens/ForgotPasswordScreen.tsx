import { images } from '@/assets/images';
import { Button, InputField, MyImage, Screen, Text } from '@/components';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useTranslation } from '@/hooks/useTranslation';
import { yupResolver } from '@hookform/resolvers/yup';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { Mail } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as yup from 'yup';
import { Header } from '../components/Header';

type EmailFormData = yup.InferType<typeof emailSchema>;

const emailSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
});

const ForgotPasswordScreen = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState<string | null>(null);
  const { sendResetPasswordLink, isLoading, errorMessage, clearError } = useAuthActions();

  const emailForm = useForm<EmailFormData>({
    resolver: yupResolver(emailSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const handleSendResetLink = async (data: EmailFormData) => {
    setMessage(null);
    clearError();
    const result = await sendResetPasswordLink(data.email);

    if (result?.success) {
      setMessage(t('Reset link has been sent to your email'));
    }
  };

  return (
    <View className="flex-1">
      <ImageBackground
        source={images.bgBallTrophy}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
      />
      <LinearGradient
        colors={['rgba(1,8,20,0.2)', 'rgba(1,9,22,0.6)', 'rgba(2,8,18,0.1)']}
        locations={[0, 0.9, 1]}
        style={[StyleSheet.absoluteFill, styles.nonInteractive]}
      />

      <Screen width="full" padding="all" edges={['top']} className="bg-transparent">
        <KeyboardAwareScrollView
          bottomOffset={72}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Header fallbackHref="/signIn" />
          <View className="mt-10 items-center">
            <View className="w-full max-w-[510px]">
              <View className="items-center">
                <MyImage source={images.passwordLogo} width={140} height={140} contentFit="contain" />
              </View>

              <View className="items-center mt-5">
                <Text variant="header" accessibilityRole="header">
                  {t('Forgot your password?')}
                </Text>
                <Text variant="bodySmall" tone="muted">
                  {t("Enter your email address and we'll send you a reset link")}
                </Text>
              </View>

              <View className="mt-5 gap-4">
                <InputField
                  control={emailForm.control}
                  name="email"
                  placeholder={t('Email')}
                  variant="auth"
                  autoComplete="email"
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  secureTextEntry={false}
                  error={emailForm.formState.errors.email}
                  icon={<Mail size={24} color="#AEB8D0" />}
                  clearError={clearError}
                />

                <View accessibilityLiveRegion="polite">
                  {errorMessage || message ? (
                    <Text className={`text-center ${errorMessage ? 'text-error' : 'text-success'}`}>
                      {errorMessage || message}
                    </Text>
                  ) : null}
                </View>

                <Button
                  variant="primary"
                  label={t('Send Reset Link')}
                  onPress={emailForm.handleSubmit(handleSendResetLink)}
                  loading={isLoading}
                  disabled={!emailForm.formState.isValid || isLoading}
                  size="lg"
                  fullWidth
                />

                <Pressable
                  onPress={() => void Linking.openURL('mailto:support@champoapp.com')}
                  accessibilityRole="link"
                  accessibilityLabel={t('Contact support')}
                  className="mt-8 items-center justify-center rounded-xl  active:opacity-70"
                >
                  <Text variant="bodySmall" tone="muted">
                    {t('Still need help?')}{' '}
                    <Text variant="bodySmall" tone="info">
                      {t('Contact support')}
                    </Text>
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </Screen>
    </View>
  );
};

const styles = StyleSheet.create({
  brandSparkle: { position: 'absolute', right: -8, top: -7 },
  deliveryCheck: { position: 'absolute', right: -6, bottom: -5 },
  nonInteractive: { pointerEvents: 'none' },
});

export default ForgotPasswordScreen;
