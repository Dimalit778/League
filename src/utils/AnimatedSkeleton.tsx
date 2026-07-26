import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

// Animated skeleton component with pulse effect
export default function AnimatedSkeleton({ style }: { style?: any }) {
  const { colors } = useThemeTokens();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { backgroundColor: colors.border, borderRadius: 4 },
        style,
        animatedStyle,
      ]}
    />
  );
}
