import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'expo-router';
import { View } from 'react-native';

const AuthLegalLinks = ({ showConsent = false }: { showConsent?: boolean }) => {
  const { t } = useTranslation();

  return (
    <View className="items-center px-5 pb-6">
      {showConsent ? (
        <Text className="mb-2 text-center text-sm text-muted">
          {t('By creating an account, you agree to:')}
        </Text>
      ) : null}
      <View className="flex-row flex-wrap items-center justify-center gap-x-2">
        <Link href="/privacy" asChild>
          <Text accessibilityRole="link" className="text-sm text-muted underline">
            {t('Privacy Policy')}
          </Text>
        </Link>
        <Text className="text-sm text-muted">·</Text>
        <Link href="/terms" asChild>
          <Text accessibilityRole="link" className="text-sm text-muted underline">
            {t('Terms of Service')}
          </Text>
        </Link>
      </View>
    </View>
  );
};

export default AuthLegalLinks;
