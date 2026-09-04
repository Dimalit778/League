import { images } from '@/assets/images';
import { Button, MyImage, Row, Text } from '@/components';
import AuthScaffold from '@/features/auth/components/auth/AuthScaffold';
import VerificationCodeInput from '@/features/auth/components/auth/VerificationCodeInput';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useTranslation } from '@/hooks/useTranslation';
import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 120;

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function VerifyEmailScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email?: string | string[] }>();
  const email = (Array.isArray(emailParam) ? emailParam[0] : emailParam)?.trim().toLowerCase();
  const { t } = useTranslation();
  const { verifyOtp, resendOtp, isLoading, errorMessage, clearError } = useAuthActions();
  const [code, setCode] = useState<string[]>(() => Array(CODE_LENGTH).fill(''));
  const [resendLoading, setResendLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((count) => count - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  const handleCodeChange = (nextCode: string[]) => {
    setCode(nextCode);
    clearError();
    setStatusMessage(null);
  };

  const handleSubmit = async () => {
    const codeString = code.join('');
    if (!email || codeString.length !== CODE_LENGTH) return;

    const result = await verifyOtp(email, codeString);
    if (result.success) setStatusMessage(t('Email verified successfully!'));
  };

  const handleResend = async () => {
    if (!email || resendLoading || isLoading || secondsLeft > 0) return;

    setResendLoading(true);
    setStatusMessage(null);
    clearError();
    const result = await resendOtp(email);
    setResendLoading(false);

    if (result.success) {
      setStatusMessage(t('Code resent successfully!'));
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    }
  };

  const isCodeValid = code.every(Boolean) && code.join('').length === CODE_LENGTH;

  const EmailNotFound = () => {
    return (
      <View className="items-center">
        <Text variant="title" tone="error" className="text-center">
          {t('Email address is missing')}
        </Text>
        <Text variant="body" tone="error" className="text-center">
          {t('Please try signing up again.')}
        </Text>
      </View>
    );
  };

  return (
    <AuthScaffold>
      <View className="items-center ">
        <MyImage source={images.mailLogo} width={100} height={100} contentFit="contain" />
      </View>
      {!email ? (
        <EmailNotFound />
      ) : (
        <View className="gap-3">
          <View>
            <Text variant="heading" size="3xl" tone="primary" className="text-center">
              {t('Verify your email')}
            </Text>
            <Text variant="body" tone="muted" className="text-center">
              {t('Enter the code sent to your email')}
            </Text>
            <Text variant="body" className="text-center text-white">{email}</Text>
          </View>
          <VerificationCodeInput value={code} onChange={handleCodeChange} hasError={Boolean(errorMessage)} />

          <View className="min-h-6 justify-center " accessibilityLiveRegion="polite">
            {errorMessage ? <Text className="text-center text-sm text-error">{errorMessage}</Text> : null}
            {statusMessage ? (
              <Text className="text-center text-sm font-semibold text-success">{statusMessage}</Text>
            ) : null}
          </View>

          <Button
            label={t('Confirm')}
            onPress={handleSubmit}
            loading={isLoading}
            disabled={!isCodeValid || isLoading}
            size="lg"
            fullWidth
            className="rounded-2xl"
          />

          <Row className="justify-between gap-2">
            <Text variant="body">
              {t('Resend code in')} <Text>{formatCountdown(secondsLeft)}</Text>
            </Text>

            <Pressable
              onPress={handleResend}
              disabled={resendLoading || isLoading || secondsLeft > 0}
              accessibilityState={{ disabled: resendLoading || isLoading || secondsLeft > 0 }}
              accessibilityRole="button"
              accessibilityLabel={t('Resend verification code')}
              className="min-h-11 justify-center rounded-lg px-2 active:opacity-70"
            >
              <Text variant="label" tone="info">
                {resendLoading ? t('Sending...') : t('Resend Code')}
              </Text>
            </Pressable>
          </Row>
        </View>
      )}
    </AuthScaffold>
  );
}
