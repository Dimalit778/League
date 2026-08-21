import { Button, Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { PLAN_LIMITS } from '@/lib/revenuecat/plans';
import { Crown } from 'lucide-react-native';
import { View } from 'react-native';

export default function ProUpsellCard({ onUpgrade }: { onUpgrade: () => void }) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  return (
    <View className="items-center pt-10">
      <View className="justify-center items-center ">
        <Text variant="body" numberOfLines={1}>
          {t('Want to open more leagues?')}
        </Text>
        <Text variant="bodySmall" tone="muted">
          {t('Upgrade to Pro and open up to {{count}} leagues', { count: PLAN_LIMITS.PRO.maxLeagues })}
        </Text>
        <Button
          variant="primary"
          size="md"
          className="mt-4"
          label={t('Upgrade to Pro')}
          leftIcon={<Crown size={16} color={colors.onPrimary} fill={colors.onPrimary} />}
          onPress={onUpgrade}
        />
      </View>
    </View>
  );
}
