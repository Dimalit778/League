import { EmptyState, Row, Text } from '@/components';
import { type MatchCardData } from '@/features/matches/utils/matchCard.mapper';
import { useTranslation } from '@/hooks/useTranslation';
import { CalendarDays } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';
import { OverviewMatchCard } from './OverviewMatchCard';

const LIST_CONTENT_STYLE = { alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingBottom: 2 } as const;

export function TodayMatches({ matches }: { matches: MatchCardData[] }) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const cardWidth = Math.round(width * 0.408);

  const cardStyle = useMemo(() => ({ width: cardWidth }), [cardWidth]);
  const renderItem = useCallback(
    ({ item }: { item: MatchCardData }) => (
      <View style={cardStyle}>
        <OverviewMatchCard match={item} />
      </View>
    ),
    [cardStyle],
  );

  return (
    <>
      <Row className="gap-2 px-4">
        <View className="h-4 w-1 rounded-full bg-primary" />
        <Text variant="subtitle" numberOfLines={1} className="min-w-0 flex-1">
          {t('Today matches')}
        </Text>
      </Row>
      {matches.length === 0 ? (
        <EmptyState size="sm" icon={CalendarDays} title={t('No matches today')} />
      ) : (
        <FlatList
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          data={matches}
          keyExtractor={(match) => match.id.toString()}
          contentContainerStyle={LIST_CONTENT_STYLE}
          renderItem={renderItem}
        />
      )}
    </>
  );
}
