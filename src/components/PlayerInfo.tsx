import { useAppStore } from "@/store/AppStore";
import { Image, View } from "react-native";
import TextC from "./ui/TextC";

const PlayerInfo = () => {
  const { player, primaryLeague } = useAppStore();

  if (!player || !primaryLeague) {
    return (
      <View className="p-4">
        <TextC>No player or league information available</TextC>
      </View>
    );
  }

  return (
    <View className="p-4 bg-gray-800 rounded-lg">
      <View className="flex-row items-center">
        {player.avatar_url && (
          <Image
            source={{ uri: player.avatar_url }}
            className="w-12 h-12 rounded-full mr-3"
          />
        )}
        <View>
          <TextC className="text-lg font-bold">
            {player.nickname || "Player"}
          </TextC>
          <TextC className="text-gray-300">Points: {player.points || 0}</TextC>
          <TextC className="text-gray-400">{primaryLeague.name}</TextC>
        </View>
      </View>
    </View>
  );
};

export default PlayerInfo;
