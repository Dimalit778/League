import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Welcome() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold">Welcome to the app</Text>
      <Button title="Sign In" onPress={() => router.push("/signIn")} />
      <Button title="Sign Up" onPress={() => router.push("/signUp")} />
    </View>
  );
}
