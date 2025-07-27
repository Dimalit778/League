import LeagueCard from "@/components/LeagueCard";
import ButtonC from "@/components/ui/ButtonC";
import { useAuthStore } from "@/hooks/useAuthStore";
import { supabase } from "@/lib/supabase";
import { joinLeague } from "@/services/leagueService";
import { League } from "@/types/database.types";
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
  const { user } = useAuthStore();
  const [inviteCode, setInviteCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchingLeague, setSearchingLeague] = useState(false);
  const [foundLeague, setFoundLeague] = useState<League | null>(null);

  const searchLeagueByInviteCode = async (code: string) => {
    if (!code.trim() || code.length < 6) {
      setFoundLeague(null);
      return;
    }

    setSearchingLeague(true);
    try {
      const { data, error } = await supabase
        .from("leagues")
        .select("*")
        .eq("invite_code", code.toUpperCase())
        .single();

      if (error || !data) {
        setFoundLeague(null);
        return;
      }

      setFoundLeague(data);
    } catch (error) {
      console.error("Error searching league:", error);
      setFoundLeague(null);
    } finally {
      setSearchingLeague(false);
    }
  };

  const handleInviteCodeChange = (code: string) => {
    const formattedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setInviteCode(formattedCode);

    if (formattedCode.length === 6) {
      searchLeagueByInviteCode(formattedCode);
    } else {
      setFoundLeague(null);
    }
  };

  const handleJoinLeague = async () => {
    if (!inviteCode.trim()) {
      Alert.alert("Error", "Please enter an invite code");
      return;
    }

    if (!nickname.trim()) {
      Alert.alert("Error", "Please enter a nickname");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to join a league");
      return;
    }

    if (!foundLeague) {
      Alert.alert("Error", "League not found with this invite code");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await joinLeague(
        foundLeague.id,
        user.id,
        nickname.trim(),
        supabase
      );

      if (error) {
        if (error.message?.includes("duplicate")) {
          Alert.alert("Error", "You are already a member of this league");
        } else {
          Alert.alert("Error", error.message || "Failed to join league");
        }
        return;
      }

      Alert.alert(
        "Success!",
        `You have successfully joined "${foundLeague.name}"!`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Join league error:", error);
    } finally {
      setLoading(false);
    }
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
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base text-center text-lg tracking-widest font-mono"
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
            <LeagueCard
              leagueId={foundLeague.selected_league}
              leagueName={foundLeague.name}
              maxMembers={foundLeague.max_members}
              showDetails={false}
              className="border-green-200 bg-green-50"
            />
          </View>
        )}

        {inviteCode.length === 6 && !foundLeague && !searchingLeague && (
          <View className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <Text className="text-red-600 text-center">
              No league found with this invite code
            </Text>
          </View>
        )}

        {/* Nickname Input */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-2">
            Your Nickname
          </Text>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            placeholder="Enter your nickname for this league"
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base"
            maxLength={20}
          />
          <Text className="text-sm text-gray-500 mt-1">
            This is how other members will see you in the league
          </Text>
        </View>

        {/* Join Button */}
        <View className="mb-8">
          <ButtonC
            title="Join League"
            onPress={handleJoinLeague}
            loading={loading}
            style={{
              opacity: !foundLeague || !nickname.trim() ? 0.5 : 1,
            }}
          />
        </View>

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
