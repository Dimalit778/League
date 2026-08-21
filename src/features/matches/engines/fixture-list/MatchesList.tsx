import { Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { useRef } from 'react';
import { FlatList, RefreshControl, useWindowDimensions } from 'react-native';
import { MatchCard } from '../../components/MatchCard';
import { getMatchCardMetrics } from '../../components/MatchCardBg';
import MatchesSkeleton from '../../components/MatchesSkeleton';
import { MatchCardData } from '../../utils/matchCard.mapper';

type MatchesListProps = {
  matches: MatchCardData[];
  onRefresh: () => void;
  bottomInset?: number;
};

function renderMatchCard({ item }: { item: MatchCardData }) {
  return <MatchCard match={item} />;
}
export default function MatchesList({ matches, onRefresh, bottomInset = 0 }: MatchesListProps) {
  const flatListRef = useRef<FlatList>(null);
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const itemHeight = getMatchCardMetrics(width).height + 10;
  if (!matches || matches.length === 0) return <MatchesSkeleton />;

  return (
    <FlatList
      ref={flatListRef}
      data={matches}
      scrollEnabled={true}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: bottomInset + 20, flexGrow: 1, paddingHorizontal: 16, gap: 10 }}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderMatchCard}
      getItemLayout={(_, index) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
      })}
      ListEmptyComponent={<Text className="text-text text-center">{t('No matches found')}</Text>}
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
    />
  );
}
