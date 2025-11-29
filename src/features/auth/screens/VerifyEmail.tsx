import { LoadingOverlay } from '@/components/layout';
import { BackButton, Button, Screen } from '@/components/ui';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useThemeTokens } from '@/features/settings/hooks/useThemeTokens';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const VerifyEmailScreen = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
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
      <Screen>
        <BackButton />
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-error text-center">Email address is missing. Please try signing up again.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {isLoading && <LoadingOverlay />}

      <KeyboardAwareScrollView bottomOffset={62} className="flex-1">
        <View className="items-center py-16">
          <Text className="text-secondary font-nunito-black text-center" style={{ fontSize: 42 }}>
            Verify Email
          </Text>
          <Text className="text-center text-muted font-nunito-bold mt-2">We've sent a 6-digit code to</Text>
          <Text className="text-center text-secondary font-nunito-bold mt-1">{email}</Text>
        </View>

        <View className="px-5 gap-4">
          <View className="flex-row justify-center gap-2">
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
                className="bg-surface border border-text rounded-lg text-center text-secondary font-nunito-bold"
                style={{
                  width: 50,
                  height: 60,
                  fontSize: 24,
                  borderColor: code[index] ? colors.secondary : colors.text,
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
              <Text className="text-green-500 text-center font-nunito-bold">Email verified successfully!</Text>
            </View>
          )}

          {resendSuccess && (
            <View className="">
              <Text className="text-green-500 text-center">Code resent successfully!</Text>
            </View>
          )}

          <Button
            title="Verify Email"
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
                <Text className="text-secondary font-bold">{resendLoading ? 'Sending...' : 'Resend Code'}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
};

export default VerifyEmailScreen;
