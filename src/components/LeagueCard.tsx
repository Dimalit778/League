import { Text, TouchableOpacity, View } from "react-native";

interface LeagueCardProps {
  leagueId: string;
  leagueName: string;
  memberCount?: number;
  maxMembers?: number;
  onPress?: () => void;
  showDetails?: boolean;
  className?: string;
}

export default function LeagueCard({
  leagueId,
  leagueName,
  memberCount,
  maxMembers,
  onPress,
  showDetails = true,
  className = "",
}: LeagueCardProps) {
  const CardComponent = onPress ? TouchableOpacity : View;
  const leagueInfo = {
    logo: null,
    name: "Unknown League",
    country: "Unknown Country",
    color: "#000000",
  };
  return (
    <CardComponent
      onPress={onPress}
      className={`p-4 bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
    >
      <View className="flex-row items-center">
        <Text>Logo</Text>
        {/* <Image
          source={
            leagueInfo.logo ||
            require("@/assets/images/default-league-logo.png")
          }
          className="w-10 h-10 rounded-lg mr-3"
          resizeMode="cover"
        /> */}

        {/* League Info */}
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
            {leagueName}
          </Text>
          <Text className="text-sm text-gray-600">
            {leagueInfo.name} • {leagueInfo.country}
          </Text>

          {showDetails &&
            memberCount !== undefined &&
            maxMembers !== undefined && (
              <Text className="text-xs text-gray-500 mt-1">
                {memberCount}/{maxMembers} members
              </Text>
            )}
        </View>

        {/* League Color Indicator */}
        <View
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: leagueInfo.color }}
        />
      </View>
    </CardComponent>
  );
}
