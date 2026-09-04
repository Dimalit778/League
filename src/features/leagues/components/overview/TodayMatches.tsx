import { EmptyState, Row, Text } from '@/components';
import { type MatchCardData } from '@/features/matches/utils/matchCard.mapper';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { CalendarDays } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';
import { OverviewMatchCard } from './OverviewMatchCard';

const LIST_CONTENT_STYLE = { alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingBottom: 4 } as const;

export function TodayMatches({ matches }: { matches: MatchCardData[] }) {
  const { t } = useTranslation();
  const { width, fontScale } = useWindowDimensions();
  const contentWidth = Math.min(width, 720);
  const cardWidth = Math.min(contentWidth - 32, Math.round(contentWidth * (fontScale > 1.3 ? 0.78 : 0.408)));

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
    <View className={cn(spacing.list)}>
      <Row className="gap-2 px-4">
        <View className="h-4 w-1 rounded-full bg-primary" />
        <Text variant="title" size="lg" numberOfLines={1} className="min-w-0 flex-1">
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
    </View>
  );
}
