import { getLeagueById } from "@/constants/leagues";
import { FootballLeague } from "@/types/database.types";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface LeagueCardProps {
  leagueId: FootballLeague;
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
  const leagueInfo = getLeagueById(leagueId);

  if (!leagueInfo) {
    return (
      <View className={`p-4 bg-gray-100 rounded-lg ${className}`}>
        <Text className="text-gray-500">Unknown league</Text>
      </View>
    );
  }

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      onPress={onPress}
      className={`p-4 bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
    >
      <View className="flex-row items-center">
        {/* Flag */}
        <Image
          source={leagueInfo.flag}
          className="w-8 h-6 rounded mr-3"
          resizeMode="cover"
        />

        {/* League Logo */}
        <Image
          source={leagueInfo.logo}
          className="w-10 h-10 rounded-lg mr-3"
          resizeMode="cover"
        />

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
