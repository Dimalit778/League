import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useRef } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { MatchWithPredictionsType } from '../../types';
import MatchesSkeleton from '../MatchesSkeleton';
import MatchesCard from './MatchesCard';

type MatchesListProps = {
  matches: MatchWithPredictionsType[] | undefined;
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
      renderItem={({ item }) => <MatchesCard key={item.id} match={item} />}
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
