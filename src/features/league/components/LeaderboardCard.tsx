import { Text, View } from "react-native";
import { Member } from "../types/leaderboard.types";
export default function LeaderboardCard({
  member,
  index,
}: {
  member: Member;
  index: number;
}) {
  return (
    <View className="flex-row items-center justify-between bg-surface rounded-lg p-3 shadow-md border border-border gap-4 mb-1">
      <View className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
        <Text className="text-sm text-black font-bold">{index}</Text>
      </View>
      <View className="w-16 h-16 rounded-full  flex items-center justify-center border border-border bg-secondary">
        <Text className="text-lg text-black font-bold">
          {member.avatar_url}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-lg text-text font-bold">{member.nickname}</Text>
      </View>
      <View className="flex-1 items-end">
        <Text className="text-lg text-text font-bold">0</Text>
      </View>
    </View>
  );
}
