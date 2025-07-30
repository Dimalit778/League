import { Button } from "@/components/Button";
import ImageC from "@/components/ui/ImageC";
import { supabase } from "@/lib/supabase";
import useAuthStore from "@/services/store/AuthStore";
import { TCompetition } from "@/types/database.types";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const generateRandomCode = (length: number): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function CreateLeague() {
  const { user } = useAuthStore();

  const [competitions, setCompetitions] = useState<TCompetition[]>([]);
  const [leagueName, setLeagueName] = useState("");
  const [selectedCompetition, setSelectedCompetition] =
    useState<TCompetition | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCompetitions = async () => {
    const { data, error } = await supabase.from("competitions").select("*");
    if (error) {
      console.error(error);
    } else {
      setCompetitions(data || []);
    }
  };

  useEffect(() => {
    getCompetitions();
  }, []);

  const handleCreateLeague = async () => {
    if (!leagueName || !selectedCompetition) {
      setError("Please fill in all fields");
      return;
    }

    console.log("leagueName", leagueName);
    console.log("league_id", selectedCompetition.id);
    console.log("owner_id", user?.id);

    if (!user?.id) {
      setError("You must be logged in to create a league");
      return;
    }

    const { data, error } = await supabase
      .from("leagues")
      .insert({
        name: leagueName,
        join_code: generateRandomCode(6),
        owner_id: user.id,
        league_id: selectedCompetition.id,
      })
      .select()
      .single();
    if (error) {
      console.log("error", error);
      setError(error.message);
    } else {
      console.log("data created", data);
      router.push("/(app)/(tabs)");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1 px-4 pt-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Create New League
        </Text>

        {/* Error message */}
        {error && (
          <View className="mb-4 p-3 bg-red-100 rounded-lg">
            <Text className="text-red-700">{error}</Text>
          </View>
        )}

        {/* League Name Input */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-2">
            League Name
          </Text>
          <TextInput
            value={leagueName}
            onChangeText={setLeagueName}
            placeholder="Enter your league name"
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base"
            maxLength={50}
          />
        </View>

        {/* League Selection */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-4">
            Select Football League
          </Text>

          {competitions.map((comp) => (
            <TouchableOpacity
              key={comp.id}
              onPress={() => setSelectedCompetition(comp)}
              className={`mb-3 p-4 rounded-xl border-2 ${
                selectedCompetition?.id === comp.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <View className="flex-row items-center gap-4">
                <ImageC
                  source={{ uri: comp.flag }}
                  // className="w-12 h-12 rounded mr-4"
                  resizeMode="contain"
                  width={52}
                  height={52}
                />
                <View className="flex-1">
                  <Text className="text-lg text-center font-bold text-gray-900">
                    {comp.name}
                  </Text>
                  <Text className="text-sm text-gray-600">{comp.name}</Text>
                </View>

                <ImageC
                  source={{ uri: comp.logo }}
                  // className="w-12 h-12 rounded-lg mr-4"
                  resizeMode="contain"
                  width={52}
                  height={52}
                />

                {/* Selection Indicator */}
                {selectedCompetition?.id === comp.id && (
                  <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected League Preview */}
        {selectedCompetition && (
          <View className="mb-6 p-4 bg-gray-50 rounded-xl">
            <Text className="text-sm text-gray-600 mb-2">Selected League:</Text>
            <View className="flex-row items-center">
              <ImageC
                source={{ uri: selectedCompetition?.logo }}
                resizeMode="contain"
                width={32}
                height={32}
              />
              <Text className="text-lg font-semibold text-gray-900">
                {selectedCompetition?.name}
              </Text>
            </View>
          </View>
        )}

        {/* Create Button */}
        <Button
          title="Create League"
          onPress={handleCreateLeague}
          variant="primary"
          size="large"
          loading={false}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
