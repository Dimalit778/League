import { Badge, Divider, Row, Text } from '@/components';
import { FrostedGlassCard } from '@/components/ui/Cards';

import { type RecentFormEntry } from '@/features/members/types/stats.type';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { useIsRTL } from '@/providers/LanguageProvider';
import { View } from 'react-native';

type CurrentFormCardProps = {
  results?: RecentFormEntry[];
};

const resultVariant = {
  L: 'error',
  H: 'primary',
  B: 'success',
} as const;

export function CurrentFormCard({ results = [] }: CurrentFormCardProps) {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const totalPoints = results.reduce((sum, result) => sum + result.points, 0);

  return (
    <FrostedGlassCard>
      <Row className={spacing.stack}>
        <View className={cn('min-w-0 flex-1', spacing.list, isRTL ? 'items-end' : 'items-start')}>
          <Text variant="caption" tone="muted">
            {t('Last 5 finished predictions')}
          </Text>
          {results.length > 0 ? (
            <View className={cn('flex-row flex-wrap', spacing.row)}>
              {results.map((result, index) => (
                <Badge
                  key={`${result.result}-${index}`}
                  label={result.result}
                  variant={resultVariant[result.result]}
                  size="md"
                  accessibilityLabel={`${result.result}, ${result.points} ${t('Points')}`}
                />
              ))}
            </View>
          ) : (
            <Text variant="bodySmall" tone="muted">
              {t('No finished predictions yet')}
            </Text>
          )}
        </View>

        <Divider orientation="vertical" className="h-16" />

        <View className="min-w-16 items-center">
          <Text variant="titleLarge" tone="primary" className="text-center">
            {totalPoints}
          </Text>
          <Text variant="caption" tone="muted" className="text-center">
            {t('Points')}
          </Text>
        </View>
      </Row>
    </FrostedGlassCard>
  );
}
