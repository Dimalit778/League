import { Text, TouchableOpacity, View } from "react-native";
import StarIcon from "../../../assets/icons/StarIcon";
import ImageC from "../ui/ImageC";

interface LeagueCardProps {
  item: any;
  handleSetPrimary: (leagueId: string) => void;
}

export default function LeagueCard({
  item,
  handleSetPrimary,
}: LeagueCardProps) {
  return (
    <TouchableOpacity
      onPress={() => {
        handleSetPrimary(item.league.id);
      }}
    >
      <View className="p-4 bg-surface rounded-xl border border-border shadow-sm">
        <View className="flex-row items-center gap-4">
          <ImageC
            source={{ uri: item.league?.league_logo }}
            width={48}
            height={48}
            resizeMode="contain"
            className="rounded-lg mr-3"
          />

          <View className="flex-1">
            <Text className="text-lg font-bold text-text" numberOfLines={1}>
              {item.league?.name}
            </Text>

            <Text className="text-sm text-textMuted">
              • Members {item.league?.max_members}
            </Text>
          </View>
          <View className="flex-row ">
            {item.is_primary && <StarIcon width={36} height={36} />}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
