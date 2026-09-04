import { Row, Text } from '@/components';
import AppleAuth from '@/features/auth/components/AppleAuth';
import GoogleAuth from '@/features/auth/components/GoogleAuth';
import AuthModeSwitchPrompt from '@/features/auth/components/auth/AuthModeSwitchPrompt';
import AuthScaffold from '@/features/auth/components/auth/AuthScaffold';
import EmailAuthForm from '@/features/auth/components/auth/EmailAuthForm';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useTranslation } from '@/hooks/useTranslation';
import { useState } from 'react';
import { View } from 'react-native';

type AuthMode = 'signIn' | 'signUp';

type AuthScreenProps = {
  initialMode?: AuthMode;
};

const Divider = () => {
  const { t } = useTranslation();
  return (
    <Row keepLtr className="items-center justify-center py-2">
      <View className="h-px flex-1 bg-[#526078]" />
      <Text className="mx-3 text-sm font-semibold text-[#9EA9BE]">{t('OR')}</Text>
      <View className="h-px flex-1 bg-[#526078]" />
    </Row>
  );
};

export default function AuthScreen({ initialMode = 'signIn' }: AuthScreenProps) {
  const { t } = useTranslation();
  const { clearError } = useAuthActions();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [socialBusy, setSocialBusy] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);

  const isSignIn = mode === 'signIn';

  const switchMode = () => {
    clearError();
    setAcceptedLegal(false);
    setMode(isSignIn ? 'signUp' : 'signIn');
  };

  return (
    <AuthScaffold className="px-4">
      <View className="h-40 items-center justify-center">
        <Text variant="heading" size="5xl" className="text-center text-white">
          {isSignIn ? t('Welcome Back') : t('Create account')}
        </Text>
      </View>
      <EmailAuthForm
        key={mode}
        mode={mode}
        acceptedLegal={acceptedLegal}
        onToggleLegal={() => setAcceptedLegal((accepted) => !accepted)}
      />
      <Divider />
      <View className="gap-3">
        <AppleAuth
          isLoading={socialBusy}
          setIsLoading={setSocialBusy}
          mode={mode}
          legalAccepted={isSignIn ? true : acceptedLegal}
        />
        <GoogleAuth
          isLoading={socialBusy}
          setIsLoading={setSocialBusy}
          mode={mode}
          legalAccepted={isSignIn ? true : acceptedLegal}
        />
      </View>

      <AuthModeSwitchPrompt mode={mode} onPress={switchMode} />
    </AuthScaffold>
  );
}
