import { Row, Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { Pressable } from 'react-native';

type AuthMode = 'signIn' | 'signUp';

export default function AuthModeSwitchPrompt({ mode, onPress }: { mode: AuthMode; onPress: () => void }) {
  const { t } = useTranslation();
  const isSignIn = mode === 'signIn';
  const action = isSignIn ? t('Sign Up') : t('Sign In');

  return (
    <Row className="flex-wrap justify-center gap-1">
      <Text className="text-center text-sm text-[#9EA9BE]">
        {isSignIn ? t("Don't have an account?") : t('Already have an account?')}
      </Text>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={action}
        hitSlop={8}
        className="min-h-11 justify-center rounded-lg px-1 active:opacity-70"
      >
        <Text className="text-center text-sm font-bold text-[#83A7FF]">{action}</Text>
      </Pressable>
    </Row>
  );
}
