import { Text } from '@/components/ui/Text';
import { useTranslation } from '@/hooks/useTranslation';
import { DimensionValue, View } from 'react-native';

type LeaguesUsageCardProps = {
  leaguesCount: number;
  totalLeaguesCount: number;
  maxLeagues: number;
  reachedLimit: boolean;
  usagePercent: number;
};

export default function LeaguesUsageCard({
  leaguesCount,
  totalLeaguesCount,
  maxLeagues,
  reachedLimit,
  usagePercent,
}: LeaguesUsageCardProps) {
  const { t } = useTranslation();
  const inactiveCount = totalLeaguesCount - leaguesCount;
  const progressWidth = `${Math.min(100, Math.max(0, usagePercent))}%` as DimensionValue;

  return (
    <View className="w-[140px] shrink-0 gap-1">
      <View className="flex-row items-center gap-2">
        <View
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-border"
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: maxLeagues, now: leaguesCount }}
        >
          <View
            style={{ width: progressWidth }}
            className={`h-full rounded-full ${reachedLimit ? 'bg-yellow-500' : 'bg-primary'}`}
          />
        </View>

        <View className="flex-row items-baseline gap-1">
          {inactiveCount > 0 && (
            <Text
              variant="small"
              className="mr-0.5 text-muted"
              accessibilityLabel={t('{{count}} inactive leagues kept in your account', {
                count: String(inactiveCount),
              })}
            >
              +{inactiveCount}
            </Text>
          )}
          <Text bold className={reachedLimit ? 'text-yellow-500' : 'text-text'}>
            {leaguesCount}
          </Text>
          <Text className="text-muted">/</Text>
          <Text bold className="text-muted">
            {maxLeagues}
          </Text>
        </View>
      </View>
    </View>
  );
}
