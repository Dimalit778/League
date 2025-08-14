import { Image } from "@/shared/components/ui";
import { Text, View } from "react-native";

export default function PreviewLeagueCard({ data }: { data: any }) {
  const { name, league_logo, competitions, max_members, member_count } = data;

  return (
    <View className="bg-card rounded-xl border border-border shadow-sm p-6 mb-6">
      <View className="flex-row items-center">
        <View className="flex-1 gap-1">
          <Text className="text-2xl font-bold mb-2" numberOfLines={2}>
            {name}
          </Text>

          <Text
            className="text-base font-semibold text-textSecondary"
            numberOfLines={1}
          >
            {competitions?.name}
          </Text>

          <View className="flex-row items-center gap-3 mt-1">
            <Image
              source={{
                uri: competitions?.flag,
              }}
              resizeMode="contain"
              width={20}
              height={20}
            />
            <Text className="text-sm text-textMuted" numberOfLines={1}>
              {competitions?.country}
            </Text>
          </View>

          <Text className="text-sm text-textMuted mt-2">
            {member_count || 1}/{max_members} members
          </Text>
        </View>

        <Image
          source={{
            uri: league_logo || competitions?.logo,
          }}
          resizeMode="contain"
          width={60}
          height={60}
          className="rounded-lg"
        />
      </View>
    </View>
  );
}
