import { useThemeStore } from '@/store/ThemeStore';
import Feather from '@expo/vector-icons/Feather';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const ThemeToggle = () => {
  // Replace useAppStore with useThemeStore
  const { theme, toggleTheme, isDark } = useThemeStore();
  const translateX = useSharedValue(isDark ? 38 : 3.3);

  useEffect(() => {
    translateX.value = withSpring(isDark ? 38 : 3.3, {
      damping: 15,
      stiffness: 150,
    });
  }, [isDark, translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <Pressable
      onPress={toggleTheme}
      className="bg-secondary relative flex-row rounded-full items-center justify-between p-1"
      accessible={true}
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
    >
      <Icon icon="sun" />
      <Icon icon="moon" />
      <Animated.View
        style={[animatedStyle]}
        className="w-8 h-8 bg-background rounded-full items-center justify-center absolute shadow-lg"
      />
    </Pressable>
  );
};

const Icon = ({ icon }: { icon: 'sun' | 'moon' }) => {
  const { isDark } = useThemeStore();

  return (
    <View className="w-10 h-10 relative z-50 rounded-full items-center justify-center">
      <Feather
        name={icon}
        size={20}
        color={isDark ? 'white' : 'black'}
        style={{
          opacity:
            (icon === 'sun' && !isDark) || (icon === 'moon' && isDark)
              ? 1
              : 0.5,
        }}
      />
    </View>
  );
};
export default ThemeToggle;
