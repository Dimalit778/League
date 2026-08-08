import { images } from '@/assets/images';
import { Brand, Button, LoadingOverlay, Screen, Text } from '@/components';
import AuthLegalLinks from '@/features/auth/components/AuthLegalLinks';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsRTL } from '@/providers/LanguageProvider';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const GOLD = '#FFB31A';
const CODE_LENGTH = 6;

function TrustEmblem({ size }: { size: number }) {
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      className="items-center justify-center rounded-[28px] border border-[#FFCC65]/70 bg-[#0B213B]/90 shadow-lg shadow-[#FFB31A]/30"
      style={{ width: size, height: size }}
    >
      <ShieldCheck size={size * 0.64} color={GOLD} strokeWidth={1.8} />
    </View>
  );
}

function VerifyBackButton({ isRTL }: { isRTL: boolean }) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/signUp');
      }}
      accessibilityRole="button"
      accessibilityLabel={t('Back')}
      hitSlop={8}
      className="size-12 items-center justify-center rounded-full border border-white/15 bg-[#061326]/70 active:opacity-70"
    >
      <ArrowLeft size={26} color="#F8FAFC" strokeWidth={2} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
    </Pressable>
  );
}

function WideVisualPanel() {
  const { t } = useTranslation();

  return (
    <View className="relative h-full flex-1 overflow-hidden border-r border-white/10">
      <ImageBackground source={images.bgWelcome} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={['rgba(2,10,23,0.18)', 'rgba(2,10,23,0.52)', 'rgba(2,9,20,0.94)']}
        style={[StyleSheet.absoluteFill, styles.nonInteractive]}
      />
      <View className="flex-1 items-center justify-between px-10 py-12">
        <Brand />
        <View className="items-center gap-8">
          <TrustEmblem size={150} />
          <View className="max-w-[520px] items-center gap-3">
            <Text className="text-center font-teko-bold text-[52px] leading-[56px] text-white">
              {t('Secure your predictions')}
            </Text>
            <Text className="text-center text-lg leading-7 text-[#B8C3D8]">
              {t('Enter the code to finish creating your account.')}
            </Text>
          </View>
        </View>
        <Text className="text-center text-sm text-[#7F8CA4]">{t('Predict. Compete. Climb.')}</Text>
      </View>
    </View>
  );
}

const VerifyEmailScreen = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const { width, height } = useWindowDimensions();
  const { verifyOtp, resendOtp, isLoading, errorMessage, clearError } = useAuthActions();
  const [resendCoolDown, setResendCoolDown] = useState(30);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const isWide = width >= 900;
  const isCompactHeight = height < 720;
  const contentWidth = Math.min(width - 40, 510);
  const codeCellSize = Math.min(64, Math.max(44, (contentWidth - 72) / CODE_LENGTH));

  useEffect(() => {
    if (resendCoolDown <= 0) return;
    const timer = setTimeout(() => setResendCoolDown((count) => count - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCoolDown]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(false), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handlePaste = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    if (!digits) return;

    const nextCode = Array(CODE_LENGTH).fill('');
    digits.split('').forEach((digit, index) => {
      nextCode[index] = digit;
    });
    setCode(nextCode);
    clearError();

    const focusIndex = Math.min(digits.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleCodeChange = (value: string, index: number) => {
    const digits = value.replace(/[^0-9]/g, '');
    if (digits.length > 1) {
      handlePaste(digits);
      return;
    }

    const nextCode = [...code];
    nextCode[index] = digits;
    setCode(nextCode);
    clearError();

    if (digits && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const codeString = code.join('');
    if (codeString.length !== CODE_LENGTH || !email) return;

    const result = await verifyOtp(email, codeString);
    if (result.success) setSuccessMessage(true);
  };

  const handleResend = async () => {
    if (!email || resendCoolDown > 0) return;

    setResendLoading(true);
    setResendSuccess(false);
    clearError();
    const result = await resendOtp(email);
    setResendLoading(false);

    if (result.success) {
      setResendSuccess(true);
      setResendCoolDown(60);
      setTimeout(() => setResendSuccess(false), 3000);
    }
  };

  const isCodeValid = code.every(Boolean) && code.join('').length === CODE_LENGTH;
  const timer = `00:${String(resendCoolDown).padStart(2, '0')}`;

  if (!email) {
    return (
      <View className="flex-1 bg-[#030B18]">
        <ImageBackground source={images.bgWelcome} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={['rgba(1,8,20,0.55)', 'rgba(2,8,18,0.98)']}
          style={[StyleSheet.absoluteFill, styles.nonInteractive]}
        />
        <Screen width="compact" padding="horizontal" edges={['top', 'bottom']} className="bg-transparent">
          <VerifyBackButton isRTL={isRTL} />
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-error">
              {t('Email address is missing. Please try signing up again.')}
            </Text>
          </View>
        </Screen>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#030B18]">
      {!isWide ? (
        <>
          <ImageBackground
            source={images.bgWelcome}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition="center"
          />
          <LinearGradient
            colors={['rgba(1,8,20,0.30)', 'rgba(1,9,22,0.76)', 'rgba(2,8,18,0.98)']}
            locations={[0, 0.42, 1]}
            style={[StyleSheet.absoluteFill, styles.nonInteractive]}
          />
        </>
      ) : null}

      <Screen width="full" padding="none" edges={['top', 'bottom']} className="bg-transparent">
        {isLoading && <LoadingOverlay />}
        <View className="flex-1" style={{ flexDirection: isWide ? (isRTL ? 'row-reverse' : 'row') : 'column' }}>
          {isWide ? <WideVisualPanel /> : null}

          <View
            className={isWide ? 'h-full bg-[#030B18]/95' : 'flex-1'}
            style={{ width: isWide ? Math.min(width * 0.52, 720) : '100%' }}
          >
            <KeyboardAwareScrollView
              bottomOffset={72}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <View className="min-h-full items-center px-5 pb-6 pt-3 sm:px-8">
                <View className="w-full max-w-[510px]">
                  <View className="relative min-h-14 justify-center">
                    <View className={isRTL ? 'absolute right-0 z-10' : 'absolute left-0 z-10'}>
                      <VerifyBackButton isRTL={isRTL} />
                    </View>
                    {!isWide ? <Brand size={isCompactHeight ? 'sm' : 'md'} /> : null}
                  </View>

                  {!isWide && !isCompactHeight ? (
                    <View className="mt-6 items-center">
                      <TrustEmblem size={width >= 600 ? 104 : 88} />
                    </View>
                  ) : null}

                  <View className={isCompactHeight ? 'mb-5 mt-5 items-center' : 'mb-7 mt-7 items-center'}>
                    <Text
                      accessibilityRole="header"
                      className="text-center font-teko-bold text-[42px] leading-[46px] text-white sm:text-[48px] sm:leading-[52px]"
                    >
                      {t('Enter the code')}
                    </Text>
                    <Text className="mt-2 text-center text-base leading-6 text-[#AFBAD0]">
                      {t('We sent a 6-digit code to')}
                    </Text>
                    <Text
                      className="mt-0.5 text-center text-base font-semibold text-white"
                      style={{ direction: 'ltr' }}
                    >
                      {email}
                    </Text>
                  </View>

                  <View
                    className={
                      isWide
                        ? 'rounded-[28px] border border-white/10 bg-[#07172A]/90 p-6 shadow-2xl shadow-black/40'
                        : 'px-1 sm:rounded-[28px] sm:border sm:border-white/10 sm:bg-[#07172A]/75 sm:p-6'
                    }
                  >
                    <View className="items-center gap-6">
                      <View className="w-full flex-row justify-center gap-2" style={{ direction: 'ltr' }}>
                        {code.map((digit, index) => {
                          const isFocused = focusedIndex === index;
                          const hasError = Boolean(errorMessage);
                          return (
                            <TextInput
                              key={index}
                              ref={(ref) => {
                                inputRefs.current[index] = ref;
                              }}
                              value={digit}
                              onChangeText={(value) => handleCodeChange(value, index)}
                              onKeyPress={(event) => handleKeyPress(event.nativeEvent.key, index)}
                              onFocus={() => setFocusedIndex(index)}
                              onBlur={() => setFocusedIndex(-1)}
                              keyboardType="number-pad"
                              textContentType={index === 0 ? 'oneTimeCode' : 'none'}
                              autoComplete={index === 0 ? 'one-time-code' : 'off'}
                              maxLength={index === 0 ? CODE_LENGTH : 1}
                              selectTextOnFocus
                              className="rounded-2xl bg-[#0A1B30]/90 text-center font-teko-bold text-[34px] text-white"
                              style={{
                                width: codeCellSize,
                                height: Math.max(62, codeCellSize * 1.18),
                                borderWidth: isFocused ? 2 : 1,
                                borderColor: hasError ? '#F87171' : isFocused ? GOLD : digit ? '#42638C' : '#29476E',
                                writingDirection: 'ltr',
                              }}
                              accessible
                              accessibilityLabel={t('Verification code digit {{number}}', { number: index + 1 })}
                              accessibilityHint={t('Enter a single digit')}
                            />
                          );
                        })}
                      </View>

                      <View className="min-h-6 justify-center" accessibilityLiveRegion="polite">
                        {errorMessage ? <Text className="text-center text-error">{errorMessage}</Text> : null}
                        {successMessage ? (
                          <Text className="text-center font-bold text-success">
                            {t('Email verified successfully!')}
                          </Text>
                        ) : null}
                        {resendSuccess ? (
                          <Text className="text-center text-success">{t('Code resent successfully!')}</Text>
                        ) : null}
                      </View>

                      <Button
                        label={t('Confirm and continue')}
                        onPress={handleSubmit}
                        loading={isLoading}
                        disabled={!isCodeValid || isLoading}
                        size="lg"
                        fullWidth
                        className="min-h-[58px] rounded-2xl bg-[#FFB31A]"
                      />

                      <View className="items-center gap-3">
                        <View
                          className="flex-row flex-wrap items-center justify-center gap-1.5"
                          style={{ direction: 'ltr', flexDirection: isRTL ? 'row-reverse' : 'row' }}
                        >
                          <Text className="text-center text-[#9EA9BE]">{t("Didn't receive the code?")}</Text>
                          {resendCoolDown > 0 ? (
                            <Text className="text-center font-semibold text-[#FFB31A]">{timer}</Text>
                          ) : (
                            <Pressable
                              onPress={handleResend}
                              disabled={resendLoading}
                              accessible
                              accessibilityRole="button"
                              accessibilityLabel={t('Resend verification code')}
                              accessibilityHint={t('Resend the verification code to your email')}
                              className="min-h-11 justify-center px-2 active:opacity-70"
                            >
                              <Text className="font-bold text-[#7EA1FF]">
                                {resendLoading ? t('Sending...') : t('Resend Code')}
                              </Text>
                            </Pressable>
                          )}
                        </View>

                        <Pressable
                          onPress={() => router.replace('/signUp')}
                          accessibilityRole="button"
                          accessibilityLabel={t('Change email address')}
                          className="min-h-11 justify-center rounded-xl px-3 active:opacity-70"
                        >
                          <Text className="text-center font-bold text-[#7EA1FF]">{t('Change email address')}</Text>
                        </Pressable>
                      </View>

                      <View className="flex-row items-center justify-center gap-2" style={{ direction: 'ltr' }}>
                        <ShieldCheck size={20} color="#91A1C4" />
                        <Text className="flex-shrink text-center text-sm leading-5 text-[#91A1B8]">
                          {t('The code is single-use and expires shortly.')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="mt-5">
                    <AuthLegalLinks />
                  </View>
                </View>
              </View>
            </KeyboardAwareScrollView>
          </View>
        </View>
      </Screen>
    </View>
  );
};

const styles = StyleSheet.create({
  brandSparkle: { position: 'absolute', right: -8, top: -7 },
  nonInteractive: { pointerEvents: 'none' },
});

export default VerifyEmailScreen;
