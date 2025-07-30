import { FlatList, Text, View } from "react-native";
import { MatchCard } from "./MatchCard";

export default function MatchesList({ allMatches }: { allMatches: any[] }) {
  console.log("allMatches", JSON.stringify(allMatches, null, 2));

  return (
    <View className="mt-4">
      <FlatList
        data={allMatches}
        renderItem={({ item }) => <MatchCard match={item} />}
        keyExtractor={(item) => item.id.toString()}
      />
      <Text className="text-white text-center mt-4">
        No matches for this fixture
      </Text>
    </View>
  );
}
