import { BackButton, Text } from '@/components/ui';
import AppleAuth from '@/features/auth/components/AppleAuth';
import AuthModeToggle from '@/features/auth/components/auth/AuthModeToggle';
import SignInForm from '@/features/auth/components/auth/SignInForm';
import SignUpForm from '@/features/auth/components/auth/SignUpForm';
import AuthLegalLinks from '@/features/auth/components/AuthLegalLinks';
import GoogleAuth from '@/features/auth/components/GoogleAuth';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useTranslation } from '@/hooks/useTranslation';
import { useState } from 'react';
import { Image, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { top } = useSafeAreaInsets();

  const handleModeChange = (nextMode: AuthMode) => {
    if (nextMode === mode) return;
    clearError();
    setMode(nextMode);
  };

  const isSignIn = mode === 'signIn';

  return (
    <>
      <Image source={require('@/assets/images/app-wallpaper.png')} className="absolute" />

      <KeyboardAwareScrollView
        bottomOffset={62}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingTop: top }}
      >
        <BackButton />

        <View className="flex-1 px-5 ">
          <View className="items-center mt-10 h-32">
            <Text title font="teko-bold" className="text-text">
              {isSignIn ? t('Welcome Back') : t('Create account')}
            </Text>
            <Text className="text-muted">{isSignIn ? t('Sign in to your account') : t('Sign up to get started')}</Text>
          </View>
          <View className="p-3 border border-border rounded-3xl">
            <AuthModeToggle mode={mode} onModeChange={handleModeChange} />

            <View className="mt-6 gap-4 px-5">
              {isSignIn ? <SignInForm key="signIn" /> : <SignUpForm key="signUp" />}

              <View className="my-2 flex-row items-center">
                <View className="h-px flex-1 bg-gray-600" />
                <Text variant="caption" className="mx-2 text-gray-400">
                  {t('OR')}
                </Text>
                <View className="h-px flex-1 bg-gray-600" />
              </View>

              <View className="gap-3">
                <AppleAuth isLoading={isAppleLoading} setIsLoading={setIsAppleLoading} mode={mode} />
                <GoogleAuth isLoading={isGoogleLoading} setIsLoading={setIsGoogleLoading} />
              </View>

              <AuthLegalLinks />
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </>
  );
}
