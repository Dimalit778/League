import { Text } from '@/components/ui';
import { BestCategory } from '@/features/members/types/stats.type';
import { useTranslation } from '@/hooks/useTranslation';
import { Award, ChevronRight } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';

const GOLD = '#E3B421';

type StatsBestCategoryProps = {
  bestCategory?: BestCategory;
};

export function StatsBestCategory({ bestCategory }: StatsBestCategoryProps) {
  const { t } = useTranslation();

  if (!bestCategory) return null;

  return (
    <View className="mx-3 mt-5">
      <View
        className="flex-row items-center overflow-hidden rounded-2xl border border-[#223554] bg-[#101A2A] p-4"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        <View className="mr-3 h-12 w-12 items-center justify-center rounded-full border border-[#D5B13F]/40 bg-[#1A2740]">
          <Award size={22} color={GOLD} />
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-xs text-[#97A7BF]">{t('Best category')}</Text>
          <Text className="text-base font-bold text-white">{t(bestCategory.name)}</Text>
          <Text className="text-sm font-semibold text-[#D5B13F]">
            {t('{{count}} correct', { count: bestCategory.value })}
          </Text>
          {bestCategory.topPercent != null && (
            <Text className="mt-0.5 text-[11px] text-[#97A7BF]">
              {t("You're in the top {{percent}}% of the league", { percent: bestCategory.topPercent })}
            </Text>
          )}
        </View>

        <TouchableOpacity
          className="ml-2 flex-row items-center rounded-xl border border-[#D5B13F]/50 px-3 py-2"
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('View breakdown')}
        >
          <Text className="text-xs font-semibold text-[#D5B13F]">{t('View breakdown')}</Text>
          <ChevronRight size={14} color={GOLD} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
