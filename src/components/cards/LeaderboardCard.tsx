import { StyleSheet, Text, View } from "react-native";

export default function LeaderboardCard({
  user,
  index,
}: {
  user: any;
  index: number;
}) {
  console.log("user", JSON.stringify(user, null, 2));
  console.log("index", index);
  return (
    <View className="flex-row items-center justify-between bg-white rounded-lg p-4 shadow-md border border-gray-200 gap-4">
      <View className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-200">
        <Text className="text-lg font-bold">{index}</Text>
      </View>
      <View className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border border-gray-200">
        <Text className="text-lg font-bold">{user.avatar_url}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-lg font-bold">{user.nickname}</Text>
      </View>
      <View className="flex-1 items-end">
        <Text className="text-lg font-bold">{user.points ?? 0}</Text>
        <Text className="text-sm text-gray-500">pts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 6,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.06)",
    elevation: 2,
  },
  rankCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rankText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#6366f1",
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#2563eb",
  },
  nameContainer: {
    flex: 1,
    justifyContent: "center",
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  usernameText: {
    fontSize: 12,
    color: "#6b7280",
  },
  pointsContainer: {
    alignItems: "flex-end",
    minWidth: 56,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f59e42",
  },
  pointsLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: -2,
  },
});
