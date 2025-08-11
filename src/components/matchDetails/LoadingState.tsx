import { ActivityIndicator, Text, View } from "react-native";

export const LoadingState = () => {
  return (
    <View className="flex-1 bg-background justify-center items-center">
      <ActivityIndicator size="large" color="#6366F1" />
      <Text className="text-text mt-4 text-lg">Loading match details...</Text>
    </View>
  );
};