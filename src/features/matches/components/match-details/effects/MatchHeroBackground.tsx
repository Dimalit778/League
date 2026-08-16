import { images } from '@/assets/images';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

export function MatchHeroBackground({
  height,
  gradientColors,
}: {
  height: number;
  gradientColors: readonly [string, string, string, string];
}) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height }}>
      <ExpoImage
        source={images.footballFieldBg}
        contentFit="cover"
        cachePolicy="memory-disk"
        priority="high"
        transition={0}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <LinearGradient
        colors={gradientColors}
        locations={[0, 0.45, 0.82, 1]}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />
    </View>
  );
}
