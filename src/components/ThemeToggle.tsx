import { useAppStore } from "@/store/useAppStore";
import Feather from "@expo/vector-icons/Feather";
import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useAppStore();
  const isDark = theme === "dark";
  const translateX = useSharedValue(isDark ? 38 : 3.3);

  useEffect(() => {
    translateX.value = withSpring(isDark ? 38 : 3.3, {
      damping: 15,
      stiffness: 150,
    });
  }, [isDark]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <Pressable
      onPress={toggleTheme}
      className=" bg-secondary relative flex-row rounded-full items-center justify-between"
    >
      <Icon icon="sun" />
      <Icon icon="moon" />
      <Animated.View
        style={[animatedStyle]}
        className="w-8 h-8 bg-background rounded-full items-center justify-center flex flex-row absolute"
      />
    </Pressable>
  );
};

const Icon = (props: any) => {
  const { theme } = useAppStore();
  const isDark = theme === "dark";

  return (
    <View className="w-10 h-10 relative z-50 rounded-full items-center justify-center flex flex-row">
      <Feather
        name={props.icon}
        size={20}
        color={`${isDark ? "white" : "black"}`}
      />
    </View>
  );
};

export default ThemeToggle;
