import { Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { BarChart3, Star } from 'lucide-react-native';
import { View } from 'react-native';
type StatsHeroCardProps = {
  points: number;
  rank: number;
};

export function StatsHeroCard({ points, rank }: StatsHeroCardProps) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  return (
    <View>
      <View className="flex-1 ">
        <View className="mx-4 flex-row items-center justify-between rounded-2xl border border-border bg-surface py-3">
          <View className="flex-1 items-center justify-center">
            <BarChart3 size={16} color={colors.primary} />
            <Text className="mt-1 text-[10px] uppercase tracking-wide text-muted">{t('Rank')}</Text>
            <Text className="mt-0.5 text-lg font-bold text-text">{rank ? `#${rank}` : '—'}</Text>
          </View>
          <View className="mx-3 w-px self-stretch bg-border" />
          <View className="flex-1 items-center justify-center">
            <Star size={16} color={colors.primary} fill={colors.primary} />
            <Text className="mt-1 text-[10px] uppercase tracking-wide text-muted">{t('Total Points')}</Text>
            <Text className="mt-0.5 text-lg font-bold text-text">{points}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
