import { syncFootballData } from "@/lib/seedFootballapi";
import { Button, Text, View } from "react-native";

export default function Rank() {
  const handleCreateLeague = async () => {
    await syncFootballData();
  };
  return (
    <View style={{ flex: 1, backgroundColor: "red" }}>
      <Text>Rank</Text>
      <View style={{ flex: 1, backgroundColor: "blue", alignItems: "center" }}>
        <Text>Create League Spain</Text>
        <Button title="Create League" onPress={handleCreateLeague} />
      </View>
    </View>
  );
}
