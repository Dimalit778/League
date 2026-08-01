import { LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, Button, Text } from '@/components/ui';
import AuthLegalLinks from '@/features/auth/components/AuthLegalLinks';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const VerifyEmailScreen = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { t } = useTranslation();
  const { verifyOtp, resendOtp, isLoading, errorMessage, clearError } = useAuthActions();
  const { colors } = useThemeTokens();
  const [resendCoolDown, setResendCoolDown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendCoolDown > 0) {
      const timer = setTimeout(() => {
        setResendCoolDown(resendCoolDown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCoolDown]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleCodeChange = (value: string, index: number) => {
    // Only allow digits
    const digits = value.replace(/[^0-9]/g, '');

    // Handle paste (multiple digits)
    if (digits.length > 1) {
      handlePaste(digits);
      return;
    }

    const newCode = [...code];
    newCode[index] = digits;
    setCode(newCode);
    clearError();

    // Auto-focus next input
    if (digits && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newCode.every((c) => c !== '') && newCode.join('').length === 6) {
      handleSubmit();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, 6);
    const newCode = [...code];
    digits.split('').forEach((digit, index) => {
      if (index < 6) {
        newCode[index] = digit;
      }
    });
    setCode(newCode);
    clearError();

    // Focus the last filled input or the 6th input
    const focusIndex = Math.min(digits.length - 1, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async () => {
    const codeString = code.join('');
    if (codeString.length !== 6) return;

    const result = await verifyOtp(email, codeString);
    if (result.success) {
      setSuccessMessage(true);
    }
  };

  const isCodeValid = code.every((c) => c !== '') && code.join('').length === 6;

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

  if (!email) {
    return (
      <Screen width="compact" padding="horizontal" edges={['top', 'bottom']}>
        <BackButton />
        <View className="flex-1 items-center justify-center">
          <Text className="text-error text-center">Email address is missing. Please try signing up again.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen width="compact" padding="horizontal" edges={['top', 'bottom']}>
      {isLoading && <LoadingOverlay />}

      <KeyboardAwareScrollView bottomOffset={62} className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center py-12 sm:py-16">
          <Text variant="display" tone="primary" className="text-center">
            Verify Email
          </Text>
          <Text variant="label" tone="muted" className="mt-2 text-center">
            {t('We sent a 6-digit code to')}
          </Text>
          <Text variant="label" tone="secondary" className="mt-1 text-center">
            {email}
          </Text>
          <Text variant="bodySmall" tone="muted" className="mt-4 text-center">
            {t('Apple and Google sign-in do not require email verification.')}
          </Text>
        </View>

        <View className={spacing.stack}>
          <View className={cn('w-full flex-row justify-center', spacing.row)}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                className="h-14 min-w-0 flex-1 rounded-lg border border-text bg-surface text-center text-2xl font-bold text-info"
                style={{
                  borderColor: code[index] ? colors.info : colors.text,
                  borderWidth: code[index] ? 2 : 1,
                }}
                selectTextOnFocus
                accessible={true}
                accessibilityLabel={`Verification code digit ${index + 1}`}
                accessibilityHint="Enter a single digit"
              />
            ))}
          </View>

          {errorMessage && (
            <View className="">
              <Text className="text-error text-center">{errorMessage}</Text>
            </View>
          )}

          {successMessage && (
            <View className="">
              <Text className="text-success text-center font-bold">Email verified successfully!</Text>
            </View>
          )}

          {resendSuccess && (
            <View className="">
              <Text className="text-success text-center">Code resent successfully!</Text>
            </View>
          )}

          <Button
            label="Verify Email"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={!isCodeValid || isLoading}
            variant="secondary"
            size="lg"
          />

          <View className="flex-row items-center justify-center mt-4 gap-2">
            <Text className="text-muted text-center">Didn't receive the code?</Text>
            {resendCoolDown > 0 ? (
              <Text className="text-muted text-center">Resend in {resendCoolDown}s</Text>
            ) : (
              <Pressable
                onPress={handleResend}
                disabled={resendLoading || resendCoolDown > 0 || !email}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Resend verification code"
                accessibilityHint="Resend the verification code to your email"
              >
                <Text className="text-info font-bold">{resendLoading ? 'Sending...' : 'Resend Code'}</Text>
              </Pressable>
            )}
          </View>

          <View className="flex-row items-center justify-center mt-6 gap-2">
            <Text className="text-sm text-muted">
              {t('Prefer not to wait?')}
            </Text>
            <Link href="/signIn" replace>
              <Text className="text-sm text-info font-bold">
                {t('Sign in with Apple or Google')}
              </Text>
            </Link>
          </View>
        </View>
        <AuthLegalLinks />
      </KeyboardAwareScrollView>
    </Screen>
  );
};

export default VerifyEmailScreen;
