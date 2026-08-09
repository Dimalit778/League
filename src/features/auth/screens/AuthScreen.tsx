import { images } from '@/assets/images';
import { BackButton, Brand, Row, Text } from '@/components';
import AppleAuth from '@/features/auth/components/AppleAuth';
import SignInForm from '@/features/auth/components/auth/SignInForm';
import SignUpForm from '@/features/auth/components/auth/SignUpForm';
import AuthLegalLinks from '@/features/auth/components/AuthLegalLinks';
import GoogleAuth from '@/features/auth/components/GoogleAuth';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsRTL } from '@/providers/LanguageProvider';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AuthMode = 'signIn' | 'signUp';

type AuthScreenProps = {
  initialMode?: AuthMode;
};

export default function AuthScreen({ initialMode = 'signIn' }: AuthScreenProps) {
  const { t } = useTranslation();
  const { clearError } = useAuthActions();
  const isRTL = useIsRTL();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [socialBusy, setSocialBusy] = useState(false);

  const insets = useSafeAreaInsets();

  const isSignIn = mode === 'signIn';

  const switchMode = () => {
    clearError();
    setMode(isSignIn ? 'signUp' : 'signIn');
  };

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      <ImageBackground
        source={images.bgWelcome}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
      />
      <LinearGradient
        colors={['rgba(1,8,20,0.35)', 'rgba(1,9,22,0.74)', 'rgba(2,8,18,0.98)']}
        locations={[0, 0.42, 1]}
        style={[StyleSheet.absoluteFill, styles.nonInteractive]}
      />

      <KeyboardAwareScrollView
        bottomOffset={72}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="mx-auto w-full max-w-[510px] px-5 pb-6 pt-3 sm:px-8">
          <BackButton fallbackHref="/(auth)" />
          <Brand size="md" onBoarding />

          <View className="mb-7 mt-7 items-center">
            <Text
              accessibilityRole="header"
              className="text-center font-teko-bold text-[42px] leading-[46px] text-white sm:text-[48px] sm:leading-[52px]"
            >
              {isSignIn ? t('Welcome Back') : t('Create account')}
            </Text>
          </View>

          <View className="gap-5 rounded-[28px] border border-white/10 bg-[#07172A]/90 p-4 shadow-2xl shadow-black/40 sm:p-6">
            {isSignIn ? <SignInForm key="signIn" /> : <SignUpForm key="signUp" />}

            {isSignIn ? (
              <>
                <Row>
                  <View className="h-px flex-1 bg-[#526078]" />
                  <Text className="mx-3 text-sm font-semibold text-[#9EA9BE]">{t('OR')}</Text>
                  <View className="h-px flex-1 bg-[#526078]" />
                </Row>
                <AppleAuth isLoading={socialBusy} setIsLoading={setSocialBusy} mode={mode} />
                <GoogleAuth isLoading={socialBusy} setIsLoading={setSocialBusy} />
              </>
            ) : null}
          </View>

          {isSignIn ? (
            <View className="mt-5">
              <AuthLegalLinks />
            </View>
          ) : null}

          <Pressable
            onPress={switchMode}
            accessibilityRole="button"
            accessibilityLabel={isSignIn ? t('Sign Up') : t('Sign In')}
            className="min-h-12 flex-row items-center justify-center gap-1 rounded-xl px-3 py-2 active:opacity-70"
            style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
          >
            <Text className="text-center text-base text-[#9EA9BE]">
              {isSignIn ? t("Don't have an account?") : t('Already have an account?')}
            </Text>
            <Text className="text-center text-base font-bold text-[#7EA1FF]">
              {isSignIn ? t('Sign Up') : t('Sign In')}
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  nonInteractive: { pointerEvents: 'none' },
});
