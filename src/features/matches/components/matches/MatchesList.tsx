import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useRef } from 'react';
import { FlatList, View } from 'react-native';
import { MatchWithPredictionsType } from '../../types';
import MatchesSkeleton from '../MatchesSkeleton';
import MatchesCard from './MatchesCard';

type MatchesListProps = {
  matches: MatchWithPredictionsType[] | undefined;
};
export default function MatchesList({ matches }: MatchesListProps) {
  const flatListRef = useRef<FlatList>(null);
  const { t } = useTranslation();
  if (!matches || matches.length === 0) return <MatchesSkeleton />;

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={matches}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MatchesCard key={item.id} match={item} />}
        getItemLayout={(_, index) => ({
          length: 80,
          offset: 80 * index,
          index,
        })}
        scrollEnabled={false}
        ListEmptyComponent={<CText className="text-text text-center">{t('No matches found')}</CText>}
      />
    </View>
  );
}
