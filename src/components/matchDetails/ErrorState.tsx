import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export const ErrorState = () => {
  return (
    <View className="flex-1 bg-background justify-center items-center px-4">
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text className="text-text text-xl font-bold mt-4 text-center">
        Failed to load match details
      </Text>
      <TouchableOpacity
        onPress={() => router.back()}
        className="mt-6 bg-primary px-6 py-3 rounded-xl"
      >
        <Text className="text-white font-semibold">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};