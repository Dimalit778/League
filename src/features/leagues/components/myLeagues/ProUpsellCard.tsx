import { Button, GlassCard, Row, Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { PLAN_LIMITS } from '@/lib/revenuecat/plans';
import { Crown } from 'lucide-react-native';
import { View } from 'react-native';

export default function ProUpsellCard({ onUpgrade }: { onUpgrade: () => void }) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  return (
    <GlassCard>
      <Row between className="items-center gap-4">
        <View className="min-w-0 flex-1 gap-1">
          <Text variant="body" numberOfLines={1}>
            {t('Want to open more leagues?')}
          </Text>
          <Text variant="bodySmall" tone="muted">
            {t('Upgrade to Pro and open up to {{count}} leagues', { count: PLAN_LIMITS.PRO.maxLeagues })}
          </Text>
          <Button
            variant="primary"
            size="sm"
            className="mt-3 self-start px-5"
            label={t('Upgrade to Pro')}
            leftIcon={<Crown size={16} color={colors.onPrimary} fill={colors.onPrimary} />}
            onPress={onUpgrade}
          />
        </View>

        <View
          className="h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
          style={{
            shadowColor: colors.primary,
            shadowOpacity: 0.5,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 0 },
          }}
        >
          <Crown size={34} color={colors.primary} fill={colors.primary} strokeWidth={1} />
        </View>
      </Row>
    </GlassCard>
  );
}
