import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useThemeStore } from '@/store/ThemeStore';
import Feather from '@expo/vector-icons/Feather';
import { memo, useEffect } from 'react';
import { type LayoutChangeEvent, Pressable, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedFeather = Animated.createAnimatedComponent(Feather);

const springConfig = {
  damping: 30,
  stiffness: 150,
};

const THUMB_SIZE = 36;
const ACTIVE_ICON_COLOR = '#FFFFFF';

const ThemeToggle = () => {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  const progress = useSharedValue(isDark ? 1 : 0);
  const travel = useSharedValue(THUMB_SIZE);

  useEffect(() => {
    progress.value = withSpring(isDark ? 1 : 0, springConfig);
  }, [isDark, progress]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [0, travel.value]) }],
  }));

  const onTrackLayout = (event: LayoutChangeEvent) => {
    travel.value = Math.max(0, event.nativeEvent.layout.width - THUMB_SIZE);
  };

  return (
    <Pressable
      onPress={toggleTheme}
      className="rounded-full bg-subtle p-0.5"
      style={{ direction: 'ltr' }}
      accessible={true}
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
    >
      <View className="relative flex-row items-center" onLayout={onTrackLayout}>
        <Animated.View
          style={[thumbStyle, { width: THUMB_SIZE, height: THUMB_SIZE }]}
          className="absolute left-0 top-0 z-0 rounded-full bg-primary"
        />
        <Icon icon="sun" progress={progress} />
        <Icon icon="moon" progress={progress} />
      </View>
    </Pressable>
  );
};

const Icon = memo(({ icon, progress }: { icon: 'sun' | 'moon'; progress: SharedValue<number> }) => {
  const { colors } = useThemeTokens();
  const isSun = icon === 'sun';

  const animatedIconStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 1], [isSun ? 1 : 0.5, isSun ? 0.5 : 1]);
    return { opacity };
  });

  const animatedIconProps = useAnimatedProps(() => {
    return {
      color: isSun
        ? interpolateColor(progress.value, [0, 1], [ACTIVE_ICON_COLOR, colors.muted])
        : interpolateColor(progress.value, [0, 1], [colors.muted, ACTIVE_ICON_COLOR]),
    };
  }, [colors.muted, isSun]);

  return (
    <View style={{ width: THUMB_SIZE, height: THUMB_SIZE }} className="relative z-10 items-center justify-center">
      <AnimatedFeather animatedProps={animatedIconProps} style={animatedIconStyle} name={icon} size={22} />
    </View>
  );
});

Icon.displayName = 'Icon';
export default ThemeToggle;
