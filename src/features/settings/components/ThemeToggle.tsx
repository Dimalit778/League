import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useIsRTL } from '@/providers/LanguageProvider';
import { useThemeStore } from '@/store/ThemeStore';
import Feather from '@expo/vector-icons/Feather';
import { memo, useEffect } from 'react';
import { Pressable, View } from 'react-native';
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

const ICON_SLOT = 32;
const ACTIVE_ICON_COLOR = '#FFFFFF';

const ThemeToggle = () => {
  const isRTL = useIsRTL();
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  const progress = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isDark ? 1 : 0, springConfig);
  }, [isDark, progress]);

  const thumbStyle = useAnimatedStyle(() => {
    const x = interpolate(progress.value, [0, 1], [0, ICON_SLOT]);
    return {
      transform: [{ translateX: isRTL ? -x : x }],
    };
  }, [isRTL]);

  return (
    <Pressable
      onPress={toggleTheme}
      className="relative flex-row items-center rounded-full bg-subtle p-0.5"
      accessible={true}
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
    >
      <Animated.View style={thumbStyle} className="absolute left-0.5 top-0.5 z-0 h-9 w-9 rounded-full bg-primary" />
      <Icon icon="sun" progress={progress} />
      <Icon icon="moon" progress={progress} />
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
    <View className="relative z-10 h-9 w-9 items-center justify-center rounded-full">
      <AnimatedFeather animatedProps={animatedIconProps} style={animatedIconStyle} name={icon} size={22} />
    </View>
  );
});

Icon.displayName = 'Icon';
export default ThemeToggle;
