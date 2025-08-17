import { useColorScheme } from "@/hooks/useColorSchema";
import { ActivityIndicator, View } from "react-native";

const Loading = () => {
  const { isDarkColorScheme } = useColorScheme();

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

export default Loading;
