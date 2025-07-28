import ButtonC from "@/components/ui/ButtonC";
import ImageC from "@/components/ui/ImageC";
import { useCreateLeague } from "@/hooks/useQueries";
import { supabase } from "@/lib/supabase";
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
interface Competition {
  id: number;
  name: string;
  country: string;
  flag: string;
  logo: string;
}
export default function CreateLeague() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [leagueName, setLeagueName] = useState("");
  const [selectedCompetition, setSelectedCompetition] =
    useState<Competition | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCompetitions = async () => {
    const { data, error } = await supabase.from("competitions").select("*");
    if (error) {
      console.error(error);
    } else {
      console.log("data", JSON.stringify(data, null, 2));
      setCompetitions(data || []);
    }
  };

  useEffect(() => {
    getCompetitions();
  }, []);

  // Use the React Query mutation hook
  const createLeagueMutation = useCreateLeague();

  const handleCreateLeague = async () => {};

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
                  <Text className="text-sm text-gray-600">{comp.country}</Text>
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
        <View className="mb-8">
          <ButtonC
            title="Create League"
            onPress={handleCreateLeague}
            loading={createLeagueMutation.isPending}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
