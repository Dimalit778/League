import { Card, Screen, Text } from '@/components/ui';
import AppleAuth from '@/features/auth/components/AppleAuth';
import AuthModeToggle from '@/features/auth/components/auth/AuthModeToggle';
import SignInForm from '@/features/auth/components/auth/SignInForm';
import SignUpForm from '@/features/auth/components/auth/SignUpForm';
import GoogleAuth from '@/features/auth/components/GoogleAuth';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { useState } from 'react';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

type AuthMode = 'signIn' | 'signUp';

type AuthScreenProps = {
  initialMode?: AuthMode;
};

export default function AuthScreen({ initialMode = 'signIn' }: AuthScreenProps) {
  const { t } = useTranslation();
  const { clearError } = useAuthActions();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const handleModeChange = (nextMode: AuthMode) => {
    if (nextMode === mode) return;
    clearError();
    setMode(nextMode);
  };

  const isSignIn = mode === 'signIn';

  return (
    <Screen padding="horizontal" width="compact">
      <KeyboardAwareScrollView
        bottomOffset={62}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className={cn('w-full ', spacing.section)}>
          <View className="items-center justify-center mb-8">
            <Text variant="display" tone="primary">
              {isSignIn ? t('Welcome Back') : t('Create account')}
            </Text>
            <Text variant="subtitle" tone="muted" className="text-center">
              {isSignIn ? t('Sign in to your account') : t('Sign up to get started')}
            </Text>
          </View>

          <Card padding="md">
            <AuthModeToggle mode={mode} onModeChange={handleModeChange} />

            <View className={cn('mt-8', spacing.stack)}>
              {isSignIn ? <SignInForm key="signIn" /> : <SignUpForm key="signUp" />}

              <View className="my-2 flex-row items-center">
                <View className="h-px flex-1 bg-border" />
                <Text variant="caption" tone="muted" className="mx-2">
                  {t('OR')}
                </Text>
                <View className="h-px flex-1 bg-border" />
              </View>

              <View className={spacing.list}>
                <AppleAuth isLoading={isAppleLoading} setIsLoading={setIsAppleLoading} mode={mode} />
                <GoogleAuth isLoading={isGoogleLoading} setIsLoading={setIsGoogleLoading} />
              </View>
            </View>
          </Card>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}
