import { emojis } from '@/assets/emoji';
import { MyImage } from '@/components/ui';
import { Text } from '@/components/ui/Text';
import { MatchCard } from '@/features/matches/components/MatchCard';
import { MatchCardData } from '@/features/matches/utils/matchCard.mapper';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { View } from 'react-native';
const EmptyMatchesList = () => {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <View className="items-center rounded-2xl border border-dashed border-border bg-surfaceSecondary py-2">
      <View className="w-24 h-24 ">
        <MyImage source={emojis.emptyListEmoji} contentFit="contain" tintColor={colors.muted} />
      </View>
      <Text caption className="text-muted">
        {t('No matches today')}
      </Text>
    </View>
  );
};

export function UpcomingMatches({ matches }: { matches: MatchCardData[] }) {
  const { t } = useTranslation();

  return (
    <View className="gap-2">
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <Text semibold className="min-w-0" numberOfLines={1}>
          {t('Today matches')}
        </Text>
      </View>

      {matches.length === 0 ? (
        <EmptyMatchesList />
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
    </View>
  );
}
