import { CText, MatchCard } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useRef } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { MatchCardData } from '../../utils/matchCard.mapper';
import MatchesSkeleton from '../MatchesSkeleton';

type MatchesListProps = {
  matches: MatchCardData[];
  onRefresh: () => void;
};
export default function MatchesList({ matches, onRefresh }: MatchesListProps) {
  const flatListRef = useRef<FlatList>(null);
  const { t } = useTranslation();
  if (!matches || matches.length === 0) return <MatchesSkeleton />;

  return (
    <FlatList
      ref={flatListRef}
      data={matches}
      scrollEnabled={true}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <MatchCard
          id={item.id}
          home={item.home}
          away={item.away}
          prediction={item.prediction}
          date={item.date}
          time={item.time}
        />
      )}
      getItemLayout={(_, index) => ({
        length: 80,
        offset: 80 * index,
        index,
      })}
      ListEmptyComponent={<CText className="text-text text-center">{t('No matches found')}</CText>}
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
    />
  );
}
