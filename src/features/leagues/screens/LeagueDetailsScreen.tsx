import { useGetLeagueDetails } from "@/features/leagues/hooks/useLeagues";
import { useTheme } from "@/providers/ThemeProvider";
import { Button, Image, Loading } from "@/shared/components/ui";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { ProfileIcon } from "../../../../assets/icons";

export default function LeagueDetailsScreen() {
  const { id: leagueId } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();

  const [isSettingPrimary, setIsSettingPrimary] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const { data: league, isLoading, error } = useGetLeagueDetails(leagueId);
  // const setPrimaryMutation = useSetPrimaryLeague();
  // const leaveMutation = useLeaveLeague();

  const handleSetPrimary = async () => {
    setIsSettingPrimary(true);
    try {
      await setPrimaryMutation.mutateAsync({ leagueId });
      Alert.alert("Success", "League set as primary successfully!");
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to set league as primary. Please try again."
      );
    } finally {
      setIsSettingPrimary(false);
    }
  };

  const handleLeaveLeague = () => {
    Alert.alert(
      "Leave League",
      "Are you sure you want to leave this league? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            setIsLeaving(true);
            try {
              await leaveMutation.mutateAsync({ leagueId });
              Alert.alert("Success", "Left league successfully!", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (error) {
              Alert.alert("Error", "Failed to leave league. Please try again.");
            } finally {
              setIsLeaving(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) return <Loading />;

  if (error || !league) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-4">
        <Text className="text-red-500 text-lg text-center mb-4">
          Failed to load league details
        </Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="secondary"
        />
      </View>
    );
  }
  console.log("league details -----", JSON.stringify(league, null, 2));

  return (
    <View className="flex-1 bg-background px-4">
      <View className="bg-border rounded-lg p-6 mb-6 items-center">
        <Text className="text-primary text-3xl font-bold  mb-2">
          {league?.competition?.name}
        </Text>
      </View>

      {/* League Stats */}
      <View className="bg-surface rounded-lg p-4 mb-6">
        <Text className="text-text text-lg font-semibold mb-3">
          League Information
        </Text>

        <View className="gap-5 mb-4">
          <View className="flex-row justify-between items-center border-b border-border pb-4">
            <Text className="text-textMuted">Max Members:</Text>
            <Text className="text-text font-medium">
              {league?.max_members} / {league?.membersCount}
            </Text>
          </View>
          <View className="flex-row items-center gap-4 justify-between border-b border-border pb-4">
            <Text className="text-textMuted">Owner:</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-text font-medium text-lg">
                {league?.league_owner?.nickname}
              </Text>
              {league?.league_owner?.avatar_url ? (
                <Image
                  source={{ uri: league?.league_owner?.avatar_url }}
                  height={20}
                  width={20}
                  resizeMode="contain"
                />
              ) : (
                <ProfileIcon
                  width={20}
                  height={20}
                  color={theme.theme === "dark" ? "#000" : "#fff"}
                  className="bg-text rounded-full p-1"
                />
              )}
            </View>
          </View>
          <View className="flex-row items-center gap-4 justify-between border-b border-border pb-4">
            <Image
              source={{ uri: league?.competition?.logo }}
              height={40}
              width={40}
              resizeMode="contain"
            />
            <Text className="text-text text-lg ">
              {league?.competition?.name}
            </Text>
          </View>
          <View className="flex-row items-center gap-4 justify-between">
            <Image
              source={{ uri: league?.competition?.flag }}
              height={40}
              width={40}
              resizeMode="contain"
            />
            <Text className="text-text text-lg">
              {league?.competition?.country}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="space-y-3">
        <Button
          title={
            isSettingPrimary ? "Setting as Primary..." : "Set as Primary League"
          }
          onPress={handleSetPrimary}
          loading={isSettingPrimary}
          disabled={isSettingPrimary || isLeaving}
          variant="primary"
        />

        <Button
          title={isLeaving ? "Leaving..." : "Leave League"}
          onPress={handleLeaveLeague}
          loading={isLeaving}
          disabled={isLeaving || isSettingPrimary}
          variant="secondary"
        />
      </View>
    </View>
  );
}
