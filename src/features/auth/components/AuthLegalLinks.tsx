import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'expo-router';
import { View } from 'react-native';

const AuthLegalLinks = () => {
  const { t } = useTranslation();

  return (
    <View className="flex-row flex-wrap items-center justify-center gap-x-2 px-5 pb-6">
      <Link href="/privacy" asChild>
        <Text variant="caption" className="text-muted underline">
          {t('Privacy Policy')}
        </Text>
      </Link>
      <Text variant="caption" className="text-muted">
        ·
      </Text>
      <Link href="/terms" asChild>
        <Text variant="caption" className="text-muted underline">
          {t('Terms of Service')}
        </Text>
      </Link>
    </View>
  );
};

export default AuthLegalLinks;
