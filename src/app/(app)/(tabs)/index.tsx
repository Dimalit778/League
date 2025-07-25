import { useUser } from "@clerk/clerk-expo";
import { Text, View } from "react-native";

export default function HomeScreen() {
  const { user } = useUser();
  console.log("home", user);
  return (
    <View style={{ flex: 1, backgroundColor: "red" }}>
      <Text>Hello</Text>
    </View>
  );
}
