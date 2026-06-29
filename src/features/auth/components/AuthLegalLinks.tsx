import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'expo-router';
import { View } from 'react-native';

const AuthLegalLinks = () => {
  const { t } = useTranslation();

  return (
    <View className="flex-row flex-wrap items-center justify-center gap-x-2 px-5 pb-6">
      <Link href="/privacy" asChild>
        <CText variant="caption" className="text-muted underline">
          {t('Privacy Policy')}
        </CText>
      </Link>
      <CText variant="caption" className="text-muted">
        ·
      </CText>
      <Link href="/terms" asChild>
        <CText variant="caption" className="text-muted underline">
          {t('Terms of Service')}
        </CText>
      </Link>
    </View>
  );
};

export default AuthLegalLinks;
