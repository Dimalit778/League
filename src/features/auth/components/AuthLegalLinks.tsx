import { Row, Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'expo-router';
import { View } from 'react-native';

const AuthLegalLinks = () => {
  const { t } = useTranslation();

  return (
    <View className="items-center px-5">
      <Row className="flex-wrap items-center justify-center gap-x-2">
        <Link href="/(auth)/privacy" asChild>
          <Text accessibilityRole="link" className="text-sm text-muted underline">
            {t('Privacy Policy')}
          </Text>
        </Link>
        <Text className="text-sm text-muted">·</Text>
        <Link href="/(auth)/terms" asChild>
          <Text accessibilityRole="link" className="text-sm text-muted underline">
            {t('Terms of Service')}
          </Text>
        </Link>
        <Text className="text-sm text-muted">·</Text>
        <Link href="/(auth)/accessibility" asChild>
          <Text accessibilityRole="link" className="text-sm text-muted underline">
            {t('Accessibility Statement')}
          </Text>
        </Link>
      </Row>
    </View>
  );
};

export default AuthLegalLinks;
