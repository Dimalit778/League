import { Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { useRef } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { MatchCard } from '../../components/MatchCard';
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
  if (!matches || matches.length === 0) return <MatchesSkeleton />;

  return (
    <FlatList
      ref={flatListRef}
      data={matches}
      scrollEnabled={true}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, gap: 8 }}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderMatchCard}
      ListEmptyComponent={<Text className="text-text text-center">{t('No matches found')}</Text>}
      ListFooterComponent={<View style={{ height: bottomInset + 20 }} />}
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
    />
  );
}
