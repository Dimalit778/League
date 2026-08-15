import { Button, Row, Text } from '@/components';
import AuthLegalLinks from '@/features/auth/components/AuthLegalLinks';
import AuthScaffold from '@/features/auth/components/auth/AuthScaffold';
import VerificationCodeInput from '@/features/auth/components/auth/VerificationCodeInput';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useTranslation } from '@/hooks/useTranslation';
import { router, useLocalSearchParams } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

const CODE_LENGTH = 6;

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { t } = useTranslation();
  const { verifyOtp, resendOtp, isLoading, errorMessage, clearError } = useAuthActions();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [resendCoolDown, setResendCoolDown] = useState(30);
  const [resendLoading, setResendLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (resendCoolDown <= 0) return;
    const timer = setTimeout(() => setResendCoolDown((count) => count - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCoolDown]);

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
    if (!email || resendCoolDown > 0 || resendLoading) return;

    setResendLoading(true);
    setStatusMessage(null);
    clearError();
    const result = await resendOtp(email);
    setResendLoading(false);

    if (result.success) {
      setStatusMessage(t('Code resent successfully!'));
      setResendCoolDown(60);
    }
  };

  const emblem = (
    <View className="size-[72px] items-center justify-center rounded-[22px] border border-[#FFCC65]/45 bg-[#0B213B]/90">
      <ShieldCheck size={38} color="#FFB31A" strokeWidth={1.8} />
    </View>
  );

  if (!email) {
    return (
      <AuthScaffold
        title={t('Enter the code')}
        fallbackHref="/(auth)/signUp"
        emblem={emblem}
        footer={<AuthLegalLinks />}
      >
        <View className="rounded-2xl border border-error/30 bg-error/10 p-4">
          <Text className="text-center text-error">
            {t('Email address is missing. Please try signing up again.')}
          </Text>
        </View>
        <Button
          label={t('Back')}
          onPress={() => router.replace('/(auth)/signUp')}
          size="lg"
          fullWidth
          className="rounded-2xl"
        />
      </AuthScaffold>
    );
  }

  const isCodeValid = code.every(Boolean) && code.join('').length === CODE_LENGTH;
  const timer = `00:${String(resendCoolDown).padStart(2, '0')}`;

  return (
    <AuthScaffold
      title={t('Enter the code')}
      description={t('We sent a 6-digit code to')}
      fallbackHref="/(auth)/signUp"
      emblem={emblem}
      footer={<AuthLegalLinks />}
    >
      <Text className="text-center text-base font-semibold text-white" ltr>
        {email}
      </Text>

      <VerificationCodeInput value={code} onChange={handleCodeChange} hasError={Boolean(errorMessage)} />

      <View className="min-h-6 justify-center" accessibilityLiveRegion="polite">
        {errorMessage ? <Text className="text-center text-sm text-error">{errorMessage}</Text> : null}
        {statusMessage ? <Text className="text-center text-sm font-semibold text-success">{statusMessage}</Text> : null}
      </View>

      <Button
        label={t('Confirm and continue')}
        onPress={handleSubmit}
        loading={isLoading}
        disabled={!isCodeValid || isLoading}
        size="lg"
        fullWidth
        className="rounded-2xl"
      />

      <View className="items-center gap-1">
        <Row className="flex-wrap justify-center gap-1">
          <Text className="text-center text-sm text-[#9EA9BE]">{t("Didn't receive the code?")}</Text>
          {resendCoolDown > 0 ? (
            <Text className="text-center text-sm font-semibold text-[#FFB31A]" ltr>
              {timer}
            </Text>
          ) : (
            <Pressable
              onPress={handleResend}
              disabled={resendLoading}
              accessibilityRole="button"
              accessibilityLabel={t('Resend verification code')}
              className="min-h-11 justify-center rounded-lg px-2 active:opacity-70"
            >
              <Text className="text-sm font-bold text-[#83A7FF]">
                {resendLoading ? t('Sending...') : t('Resend Code')}
              </Text>
            </Pressable>
          )}
        </Row>

        <Pressable
          onPress={() => router.replace('/(auth)/signUp')}
          accessibilityRole="button"
          accessibilityLabel={t('Change email address')}
          className="min-h-11 justify-center rounded-lg px-2 active:opacity-70"
        >
          <Text className="text-center text-sm font-semibold text-[#83A7FF]">{t('Change email address')}</Text>
        </Pressable>
      </View>

      <Row keepLtr className="justify-center gap-2 rounded-2xl bg-white/5 px-3 py-3">
        <ShieldCheck size={18} color="#91A1C4" />
        <Text className="flex-shrink text-center text-xs leading-5 text-[#91A1B8]">
          {t('The code is single-use and expires shortly.')}
        </Text>
      </Row>
    </AuthScaffold>
  );
}
