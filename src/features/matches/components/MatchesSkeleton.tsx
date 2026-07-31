import { MatchCardSkeleton as DesignSystemMatchCardSkeleton } from '@/components/ui';
import { FlatList } from 'react-native';

const SKELETON_COUNT = 6;

type MatchesSkeletonProps = {
  count?: number;
  bottomInset?: number;
};

export const MatchCardSkeleton = () => <DesignSystemMatchCardSkeleton className="mb-3" />;

export default function MatchesSkeleton({ count = SKELETON_COUNT, bottomInset = 0 }: MatchesSkeletonProps) {
  const items = Array.from({ length: count }, (_, index) => index);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => `match-skeleton-${item}`}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: bottomInset + 20, flexGrow: 1 }}
      renderItem={() => <MatchCardSkeleton />}
    />
  );
}
