import AppleAuth from '@/features/auth/components/AppleAuth';
import AuthLegalLinks from '@/features/auth/components/AuthLegalLinks';
import GoogleAuth from '@/features/auth/components/GoogleAuth';
import AuthDivider from '@/features/auth/components/auth/AuthDivider';
import AuthModeSwitchPrompt from '@/features/auth/components/auth/AuthModeSwitchPrompt';
import AuthScaffold from '@/features/auth/components/auth/AuthScaffold';
import SignInForm from '@/features/auth/components/auth/SignInForm';
import SignUpForm from '@/features/auth/components/auth/SignUpForm';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useTranslation } from '@/hooks/useTranslation';
import { useState } from 'react';
import { View } from 'react-native';

type AuthMode = 'signIn' | 'signUp';

type AuthScreenProps = {
  initialMode?: AuthMode;
};

export default function AuthScreen({ initialMode = 'signIn' }: AuthScreenProps) {
  const { t } = useTranslation();
  const { clearError } = useAuthActions();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [socialBusy, setSocialBusy] = useState(false);

  const isSignIn = mode === 'signIn';

  const switchMode = () => {
    clearError();
    setMode(isSignIn ? 'signUp' : 'signIn');
  };

  return (
    <AuthScaffold
      title={isSignIn ? t('Welcome Back') : t('Create account')}
      footer={
        <View className="gap-8">
          <AuthModeSwitchPrompt mode={mode} onPress={switchMode} />
          {isSignIn ? <AuthLegalLinks /> : null}
        </View>
      }
    >
      {isSignIn ? <SignInForm key="signIn" /> : <SignUpForm key="signUp" />}

      <AuthDivider label={t('OR')} />

      <View className="flex-row items-center justify-center gap-6" style={{ direction: 'ltr' }}>
        <AppleAuth isLoading={socialBusy} setIsLoading={setSocialBusy} mode={mode} />
        <GoogleAuth isLoading={socialBusy} setIsLoading={setSocialBusy} />
      </View>
    </AuthScaffold>
  );
}
