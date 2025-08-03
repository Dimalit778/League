import { Text, View } from "react-native";
import ImageC from "../ui/ImageC";

export default function PreviewLeagueCard({
  leagueName,
  competitionName,
  competitionFlag,
  competitionLogo,
  competitionCountry,
}: {
  leagueName: string;
  competitionName: string;
  competitionFlag: string;
  competitionLogo: string;
  competitionCountry?: string;
}) {
  return (
    <View className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <View className="flex-row items-center">
        <View className="flex-1 gap-1">
          <Text className="text-4xl font-bold text-gray-900 mb-6">
            {leagueName}
          </Text>

          <Text className="text-md font-bold text-gray-900" numberOfLines={1}>
            {competitionName}
          </Text>
          <View className="flex-row items-center gap-3">
            <ImageC
              source={{ uri: competitionFlag }}
              resizeMode="contain"
              width={25}
              height={25}
            />
            <Text className="text-md text-gray-900" numberOfLines={1}>
              {competitionCountry}
            </Text>
          </View>
        </View>
        <ImageC
          source={{ uri: competitionLogo }}
          resizeMode="contain"
          width={70}
          height={70}
        />
      </View>
    </View>
  );
}
