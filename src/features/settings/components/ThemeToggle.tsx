import { useIsRTL } from '@/providers/LanguageProvider';
import { useThemeStore } from '@/store/ThemeStore';
import Feather from '@expo/vector-icons/Feather';
import { memo, useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const springConfig = {
  damping: 15,
  stiffness: 150,
};

const ThemeToggle = () => {
  const isRTL = useIsRTL();
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  const progress = useSharedValue(isDark ? 1 : 0);
  const translateX = useSharedValue(isDark ? (isRTL ? 3.3 : 32) : isRTL ? 32 : 3.3);

  useEffect(() => {
    const targetProgress = isDark ? 1 : 0;
    const targetTranslateX = isDark ? (isRTL ? 3.3 : 32) : isRTL ? 32 : 3.3;

    progress.value = withSpring(targetProgress, springConfig);
    translateX.value = withSpring(targetTranslateX, springConfig);
  }, [isRTL, progress, translateX, isDark]);

  const toggleHandler = () => {
    toggleTheme();
  };

  const animatedStyle = useAnimatedStyle(() => {
    // For RTL, we need to invert the translation direction
    const x = isRTL ? -translateX.value : translateX.value;
    return {
      transform: [{ translateX: x }],
    };
  });

  return (
    <Pressable
      onPress={toggleHandler}
      className="bg-secondary relative flex-row rounded-full items-center justify-between p-1"
      accessible={true}
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
    >
      <Icon icon="sun" progress={progress} />
      <Icon icon="moon" progress={progress} />
      <Animated.View
        style={[animatedStyle]}
        className="w-8 h-8 bg-background rounded-full items-center justify-center absolute"
      />
    </Pressable>
  );
};
const Icon = memo(({ icon, progress }: { icon: 'sun' | 'moon'; progress: SharedValue<number> }) => {
  const animatedIconStyle = useAnimatedStyle(() => {
    const isSun = icon === 'sun';
    const opacity = interpolate(progress.value, [0, 1], [isSun ? 1 : 0.5, isSun ? 0.5 : 1]);

    const color = interpolateColor(progress.value, [0, 1], ['black', 'white']);

    return {
      opacity,
      color,
    };
  });

  return (
    <View className="w-8 h-8 relative z-50 rounded-full items-center justify-center">
      <Animated.Text style={animatedIconStyle}>
        <Feather name={icon} size={20} color={animatedIconStyle.color} />
      </Animated.Text>
    </View>
  );
});

Icon.displayName = 'Icon';
export default ThemeToggle;
