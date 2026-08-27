import { Row, Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type Props = {
  accepted: boolean;
  onToggle: () => void;
};

export default function AuthLegalConsent({ accepted, onToggle }: Props) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <Row className="gap-2.5">
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityLabel={t('Confirm you are 13 or older and accept Terms of Service and Privacy Policy')}
        accessibilityState={{ checked: accepted }}
        hitSlop={8}
      >
        <View
          className="size-7 items-center justify-center rounded-md border"
          style={{ borderColor: colors.primary, backgroundColor: accepted ? colors.primary : 'transparent' }}
        >
          {accepted ? <Check size={20} color={colors.onPrimary} strokeWidth={3} /> : null}
        </View>
      </Pressable>

      <View className="min-w-0 flex-1 flex-row flex-wrap items-center gap-x-1">
        <Text variant="bodySmall" tone="muted">
          {t('I am 13 or older, and I agree to the')}
        </Text>
        <Link href="/(auth)/terms" asChild>
          <Text variant="bodySmall" tone="info" accessibilityRole="link" className="underline">
            {t('Terms of Service')}
          </Text>
        </Link>
        <Text variant="bodySmall" tone="muted">
          {t('and acknowledge the')}
        </Text>
        <Link href="/(auth)/privacy" asChild>
          <Text variant="bodySmall" tone="info" accessibilityRole="link" className="underline">
            {t('Privacy Policy')}
          </Text>
        </Link>
      </View>
    </Row>
  );
}
