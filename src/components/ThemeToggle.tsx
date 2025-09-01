import { useThemeStore } from '@/store/ThemeStore';
import Feather from '@expo/vector-icons/Feather';
import { Pressable, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  const progress = useSharedValue(isDark ? 1 : 0);
  const translateX = useSharedValue(isDark ? 32 : 3.3);

  const toggleHandler = () => {
    toggleTheme();
    progress.value = withSpring(isDark ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });
    translateX.value = withSpring(isDark ? 3.3 : 32, {
      damping: 15,
      stiffness: 150,
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
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
const Icon = ({
  icon,
  progress,
}: {
  icon: 'sun' | 'moon';
  progress: SharedValue<number>;
}) => {
  const animatedIconStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 1],
      [icon === 'sun' ? 1 : 0.5, icon === 'moon' ? 1 : 0.5]
    );

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
};

export default ThemeToggle;
