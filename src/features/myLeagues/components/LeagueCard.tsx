import { Image } from "@/shared/components/ui";
import { Text, TouchableOpacity, View } from "react-native";
import StarIcon from "../../../../assets/icons/StarIcon";
import { League } from "../types/league.types";

interface LeagueCardProps {
  item: League;
  onPress: () => void;
}

export default function LeagueCard({ item, onPress }: LeagueCardProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View className="p-4 bg-surface rounded-xl border border-border shadow-sm">
        <View className="flex-row items-center gap-4">
          <Image
            source={{ uri: item.competition_logo }}
            width={48}
            height={48}
            resizeMode="contain"
            className="rounded-lg mr-3"
          />

          <View className="flex-1">
            <Text className="text-lg font-bold text-text" numberOfLines={1}>
              {item.league_name}
            </Text>

            <Text className="text-sm text-textMuted">
              {item.member_count} / {item.max_members} members
            </Text>
          </View>
          <View className="justify-end items-end">
            {item.is_primary && <StarIcon width={36} height={36} />}
            <Text className="text-lg text-textMuted">{item.nickname}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
