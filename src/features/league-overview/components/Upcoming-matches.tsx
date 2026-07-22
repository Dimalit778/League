import { Card, DirectionalIcon } from '@/components/ui';
import { Text } from '@/components/ui/Text';
import { MatchCard } from '@/features/matches/components/MatchCard';
import { MatchCardData } from '@/features/matches/utils/matchCard.mapper';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'expo-router';
import { CalendarDays, Goal } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export function UpcomingMatches({ matches }: { matches: MatchCardData[] }) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  return (
    <Card padding="md" className="mt-2">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <View className="h-9 w-9 items-center justify-center rounded-full border border-border bg-surfaceSecondary">
            <CalendarDays size={19} color={colors.primary} strokeWidth={1.8} />
          </View>
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <Text semibold className="min-w-0" numberOfLines={1}>
              {t('Today matches')}
            </Text>
            <View className="min-w-7 items-center rounded-full border border-border bg-surface px-2 py-0.5">
              <Text small semibold style={{ color: colors.primary }}>
                {matches.length}
              </Text>
            </View>
          </View>
        </View>
        <Link href="/(app)/(league)/(tabs)/Matches" asChild>
          <Pressable
            className="flex-row items-center rounded-full border border-border bg-surfaceSecondary px-2.5 py-1 active:opacity-90"
            accessibilityRole="button"
          >
            <Text small className="text-muted">
              {t('View all')}-
            </Text>
            <DirectionalIcon size={15} color={colors.muted} strokeWidth={1.8} />
          </Pressable>
        </Link>
      </View>

      {matches.length === 0 ? (
        <View className="items-center rounded-2xl border border-dashed border-border bg-surfaceSecondary px-4 py-6">
          <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-surface">
            <Goal size={20} color={colors.muted} strokeWidth={1.7} />
          </View>
          <Text caption semibold className="text-muted text-center">
            {t('No matches today')}
          </Text>
        </View>
      ) : (
        matches.map((item) => (
          <MatchCard
            key={item.id}
            id={item.id}
            home={item.home}
            away={item.away}
            prediction={item.prediction}
            predictionStatus={item.predictionStatus}
            status={item.status}
            date={item.date}
            time={item.time}
          />
        ))
      )}
    </Card>
  );
}
