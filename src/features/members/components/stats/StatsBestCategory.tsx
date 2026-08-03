import { Button, Card, Text } from '@/components/ui';
import { BestCategory } from '@/features/members/types/stats.type';
import { useTranslation } from '@/hooks/useTranslation';
import { Award, ChevronRight } from 'lucide-react-native';
import { View } from 'react-native';

const GOLD = '#E3B421';

type StatsBestCategoryProps = {
  bestCategory?: BestCategory;
};

export function StatsBestCategory({ bestCategory }: StatsBestCategoryProps) {
  const { t } = useTranslation();

  if (!bestCategory) return null;

  return (
    <View className="mx-3 mt-5">
      <Card
        contentClassName="flex-row items-center"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        <View className="mr-3 h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-subtle">
          <Award size={22} color={GOLD} />
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-xs text-muted">{t('Best category')}</Text>
          <Text className="text-base font-bold text-white">{t(bestCategory.name)}</Text>
          <Text className="text-sm font-semibold text-primary">
            {t('{{count}} correct', { count: bestCategory.value })}
          </Text>
          {bestCategory.topPercent != null && (
            <Text variant="bodySmall" className="mt-0.5 text-muted">
              {t("You're in the top {{percent}}% of the league", { percent: bestCategory.topPercent })}
            </Text>
          )}
        </View>

        <Button
          className="ml-2 border-primary/50"
          variant="outline"
          size="sm"
          label={t('View breakdown')}
          rightIcon={<ChevronRight size={14} color={GOLD} />}
          accessibilityRole="button"
          accessibilityLabel={t('View breakdown')}
        />
      </Card>
    </View>
  );
}
