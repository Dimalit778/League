import { Image } from "@/shared/components/ui";
import { Feather } from "@expo/vector-icons";
import { Link, useLocalSearchParams } from "expo-router";
import {
  Alert,
  Clipboard,
  SafeAreaView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LeagueCreatedScreen() {
  const { leagueData } = useLocalSearchParams();

  const parsedLeagueData = JSON.parse(leagueData as string);

  const handleCopyJoinCode = () => {
    if (typeof parsedLeagueData?.join_code === "string") {
      Clipboard.setString(parsedLeagueData?.join_code || "");
      Alert.alert("Copied!", "Join code copied to clipboard.");
    }
  };

  const handleShareJoinCode = async () => {
    try {
      const shareMessage = `🏆 Join my ${parsedLeagueData?.competitions?.name || "Football"} league "${parsedLeagueData?.name}"!\n\nUse code: ${parsedLeagueData?.join_code}\n\nDownload the app to join!`;

      await Share.share({
        message: shareMessage,
        title: `Join ${parsedLeagueData?.name} League`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-6 py-10">
      {/* Success Header */}
      <View className="items-center mb-8">
        <Text className="text-2xl font-bold text-center mb-2 text-text">
          League Created Successfully! 🎉
        </Text>
        <Text className="text-base text-textMuted text-center">
          Your {parsedLeagueData?.competitions?.name || "Football"} league is
          ready
        </Text>
      </View>

      {/* League Info Card */}
      <View className="bg-card rounded-2xl p-6 mb-8 border border-border shadow-sm">
        {/* Centered League Header */}
        <View className="items-center mb-6">
          <Image
            source={{
              uri:
                parsedLeagueData?.league_logo ||
                parsedLeagueData?.competitions?.logo,
            }}
            className="rounded-2xl mb-4 shadow-sm"
            width={80}
            height={80}
            resizeMode="contain"
          />
          <Text className="text-2xl font-bold text-center text-text mb-2 mt-4">
            {parsedLeagueData?.name}
          </Text>
          <Text className="text-base text-textMuted text-center">
            {parsedLeagueData?.competitions?.country} •{" "}
            {parsedLeagueData?.competitions?.name}
          </Text>
        </View>

        <View className="bg-background/50 rounded-xl p-4 mb-4 border border-border/50">
          <Text className="text-sm font-medium text-textMuted mb-1 text-center">
            Your Nickname
          </Text>
          <Text className="text-lg font-bold text-text text-center">
            {parsedLeagueData?.nickname}
          </Text>
        </View>

        <View className="bg-background/50 rounded-xl p-4">
          <Text className="text-sm font-medium text-textMuted mb-3 text-center">
            League Join Code
          </Text>
          <TouchableOpacity
            onPress={handleCopyJoinCode}
            className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-3"
          >
            <Text className="text-2xl font-mono font-bold text-primary text-center tracking-[8px]">
              {parsedLeagueData?.join_code}
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-textMuted text-center">
            Tap to copy code
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="space-y-3 mb-8">
        <TouchableOpacity
          onPress={handleShareJoinCode}
          className="bg-primary rounded-xl p-4 flex-row items-center justify-center"
        >
          <Feather name="share" size={20} color="#374151" />
          <Text className="text-primaryForeground font-semibold ml-2 text-base">
            Share Join Code
          </Text>
        </TouchableOpacity>
      </View>

      {/* Start League Button */}
      <Link href="/(app)/(tabs)/leagues" asChild>
        <TouchableOpacity
          className="bg-primary rounded-xl items-center py-4 px-4"
          activeOpacity={0.8}
        >
          <Text className="text-primaryForeground text-lg font-bold">
            Start League
          </Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}
