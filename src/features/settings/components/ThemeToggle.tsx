import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useThemeStore } from '@/store/ThemeStore';
import { useTranslation } from '@/hooks/useTranslation';
import Feather from '@expo/vector-icons/Feather';
import { memo, useEffect } from 'react';
import { type LayoutChangeEvent, Pressable, View } from 'react-native';
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const springConfig = {
  damping: 30,
  stiffness: 150,
};

const THUMB_SIZE = 36;
const ACTIVE_ICON_COLOR = '#FFFFFF';

const ThemeToggle = () => {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { t } = useTranslation();
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
      className="min-h-12 rounded-full bg-subtle p-1.5"
      style={{ direction: 'ltr' }}
      accessible={true}
      accessibilityLabel={t(isDark ? 'Switch to light theme' : 'Switch to dark theme')}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
    >
      <View className="relative flex-row items-center" onLayout={onTrackLayout}>
        <Animated.View
          style={[thumbStyle, { width: THUMB_SIZE, height: THUMB_SIZE }]}
          className="absolute left-0 top-0 z-0 rounded-full bg-primary"
        />
        <Icon icon="sun" progress={progress} isActive={!isDark} />
        <Icon icon="moon" progress={progress} isActive={isDark} />
      </View>
    </Pressable>
  );
};

const Icon = memo(
  ({ icon, progress, isActive }: { icon: 'sun' | 'moon'; progress: SharedValue<number>; isActive: boolean }) => {
    const { colors } = useThemeTokens();
    const isSun = icon === 'sun';

    const animatedIconStyle = useAnimatedStyle(() => {
      const opacity = interpolate(progress.value, [0, 1], [isSun ? 1 : 0.5, isSun ? 0.5 : 1]);
      return { opacity };
    });

    return (
      <View style={{ width: THUMB_SIZE, height: THUMB_SIZE }} className="relative z-10 items-center justify-center">
        <Animated.View style={animatedIconStyle}>
          <Feather color={isActive ? ACTIVE_ICON_COLOR : colors.muted} name={icon} size={22} />
        </Animated.View>
      </View>
    );
  },
);

Icon.displayName = 'Icon';
export default ThemeToggle;
