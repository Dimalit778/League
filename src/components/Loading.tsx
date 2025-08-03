import { useColorScheme } from "@/hooks/useColorSchema";
import { ActivityIndicator, View } from "react-native";

export const Loading = () => {
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  return (
    <View
      className={`flex-1 justify-center items-center ${
        isDarkColorScheme ? "bg-black" : "bg-white"
      }`}
    >
      <ActivityIndicator
        size="large"
        color={isDarkColorScheme ? "white" : "black"}
      />
    </View>
  );
};
