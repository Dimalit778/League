import AnimatedSkeleton from '@/utils/AnimatedSkeleton';
import { FlatList, View } from 'react-native';

const skeletonFixtures = Array.from({ length: 12 }, (_, i) => i + 1);

export default function SkeletonFixtures() {
  return (
    <View>
      <FlatList
        data={skeletonFixtures}
        keyExtractor={(item) => `fixture-skeleton-${item}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        renderItem={() => (
          <View style={{ marginHorizontal: 5 }}>
            <AnimatedSkeleton
              style={{
                width: 50,
                height: 50,
                borderRadius: 10,
              }}
            />
          </View>
        )}
      />
    </View>
  );
}
