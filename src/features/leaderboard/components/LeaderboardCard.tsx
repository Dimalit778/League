import { Text, View } from "react-native";
type User = {
  id: number;
  nickname: string;
  points: number | null;
  avatar_url?: string;
};
export default function LeaderboardCard({
  user,
  index,
}: {
  user: User;
  index: number;
}) {
  return (
    <View className="flex-row items-center justify-between bg-surface rounded-lg p-3 shadow-md border border-border gap-4">
      <View className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
        <Text className="text-lg text-black font-bold">{index}</Text>
      </View>
      <View className="w-16 h-16 rounded-full  flex items-center justify-center border border-border">
        <Text className="text-lg text-black font-bold">{user.avatar_url}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-lg text-text font-bold">{user.nickname}</Text>
      </View>
      <View className="flex-1 items-end">
        <Text className="text-lg text-text font-bold">{user.points ?? 0}</Text>
        <Text className="text-sm text-textMuted">pts</Text>
      </View>
    </View>
  );
}
