import PreviewLeagueCard from "@/components/cards/PreviewLeagueCard";
import { Button } from "@/components/ui";
import { useLeagueService } from "@/services/leagueService";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function JoinLeague() {
  const { findLeagueByJoinCode, joinLeague } = useLeagueService();
  const [inviteCode, setInviteCode] = useState("");
  const [searchingLeague, setSearchingLeague] = useState(false);
  const [foundLeague, setFoundLeague] = useState<any | null>(null);

  const handleInviteCodeChange = async (code: string) => {
    const formattedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setInviteCode(formattedCode);
    if (formattedCode.length === 6) {
      const { data, error } = await findLeagueByJoinCode(formattedCode);
      if (error) {
        Alert.alert("Error", "League not found with this invite code");
        return;
      }
      setFoundLeague(data);
    } else {
      setFoundLeague(null);
    }
  };
  const onClickJoinLeague = async () => {
    if (!foundLeague) {
      Alert.alert("Error", "League not found with this invite code");
      return;
    }
    const { data, error } = await joinLeague(foundLeague?.id as string);
    if (error) {
      Alert.alert("Error", "Failed to join league");
      return;
    }
    Alert.alert("Success", "You have successfully joined the league");
    router.replace("/(app)/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1 px-4 pt-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Join League
        </Text>
        {/* Invite Code Input */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-2">
            Invite Code
          </Text>
          <TextInput
            value={inviteCode}
            onChangeText={handleInviteCodeChange}
            placeholder="Enter 6-digit invite code"
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3  text-center text-lg tracking-widest font-mono"
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <Text className="text-sm text-gray-500 mt-1 text-center">
            Ask the league admin for the invite code
          </Text>
        </View>

        {/* League Preview */}
        {searchingLeague && (
          <View className="mb-6 p-4 bg-gray-50 rounded-xl">
            <Text className="text-center text-gray-500">Searching...</Text>
          </View>
        )}

        {foundLeague && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-700 mb-3">
              League Found
            </Text>
            <PreviewLeagueCard
              leagueName={foundLeague.name}
              competitionName={foundLeague.competitions.name}
              competitionFlag={foundLeague.competitions.flag}
              competitionLogo={foundLeague.competitions.logo}
              competitionCountry={foundLeague.competitions.country}
            />
            <Button title="Join League" onPress={() => onClickJoinLeague()} />
          </View>
        )}

        {inviteCode.length === 6 && !foundLeague && !searchingLeague && (
          <View className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <Text className="text-red-600 text-center">
              No league found with this invite code
            </Text>
          </View>
        )}

        {/* How it Works */}
        <View className="mb-6 p-4 bg-blue-50 rounded-xl">
          <Text className="text-lg font-semibold text-blue-900 mb-2">
            How to Join a League
          </Text>
          <Text className="text-blue-800 text-sm leading-5">
            1. Get the 6-digit invite code from the league admin{"\n"}
            2. Enter the code above to find the league{"\n"}
            3. Choose your nickname for the league{"\n"}
            4. Tap "Join League" to become a member
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
