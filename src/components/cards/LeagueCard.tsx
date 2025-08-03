import useAuthStore from "@/services/store/AuthStore";
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
  const { session } = useAuthStore();

  return (
    <TouchableOpacity
      onPress={() => {
        handleSetPrimary(item.id);
      }}
    >
      <View className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <View className="flex-row items-center gap-4">
          <ImageC
            source={{ uri: item.competition_logo }}
            width={48}
            height={48}
            className="rounded-lg mr-3"
          />

          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-sm text-gray-600">
              • {item.competition_name}
            </Text>
            <Text className="text-sm text-gray-600">
              • Members {item.max_members}
            </Text>
          </View>
          <View className="flex-row ">
            {item.primary_league && <StarIcon width={36} height={36} />}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
