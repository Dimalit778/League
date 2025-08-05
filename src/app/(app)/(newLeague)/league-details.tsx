import LoadingOverlay from "@/components/LoadingOverlay";
import { ButtonC, InputField, TextC } from "@/components/ui";
import { useLeagueService } from "@/services/leagueService";
import { Tables, TablesInsert } from "@/types/database.types";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as yup from "yup";

type Competition = Tables<"competitions">;
type League = TablesInsert<"leagues">;
type LeagueAndMember = TablesInsert<"leagues"> & TablesInsert<"league_members">;

const generateRandomCode = (length: number): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
const schema = yup.object().shape({
  leagueName: yup
    .string()
    .required("League name is required")
    .min(2, "League name must be at least 3 characters long"),
  nickname: yup
    .string()
    .required("Nickname is required")
    .min(2, "Nickname must be at least 2 characters long"),
});

export default function EnterLeagueDetailsScreen() {
  const queryClient = useQueryClient();
  const { createLeague } = useLeagueService();
  const { competition } = useLocalSearchParams();

  const selectedCompetition: Competition | null = competition
    ? JSON.parse(competition as string)
    : null;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<{
    leagueName: string;
    nickname: string;
  }>({
    defaultValues: {
      leagueName: "",
      nickname: "",
    },
    mode: "onChange",
    resolver: yupResolver(schema),
  });

  const [membersCount, setMembersCount] = useState<number | null>(null);

  const { mutate: createLeagueMutation, isPending } = useMutation({
    mutationFn: (data: { leagueName: string; nickname: string }) => {
      return createLeague({
        name: data.leagueName.trim(),
        nickname: data.nickname.trim(),
        league_logo: selectedCompetition!.logo as string,
        join_code: generateRandomCode(6),
        competition_id: selectedCompetition!.id as number,
        max_members: membersCount! as number,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["myLeagues"] });
      console.log("onSuccess ---->", JSON.stringify(data, null, 2));
      router.push({
        pathname: "/(app)/(newLeague)/league-details",
        params: {
          league: JSON.stringify(data),
          // nickname: data?.league?.nickname as string,
        },
      });
    },
    onError: (error: any) => {
      console.log("onError ---->", JSON.stringify(error, null, 2));
      console.error("Error creating league:", error);
      const errorMessage =
        error?.message || "Failed to create league. Please try again.";
      Alert.alert("Error", errorMessage);
    },
  });

  const onSubmit = (data: { leagueName: string; nickname: string }) => {
    if (isPending) return;

    // Additional validation for non-form fields
    if (!membersCount) {
      Alert.alert("Error", "Please select the number of members.");
      return;
    }

    if (!selectedCompetition) {
      Alert.alert(
        "Error",
        "Competition data is missing. Please go back and select it again."
      );
      return;
    }

    createLeagueMutation(data);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-dark" behavior="padding">
      <ScrollView className="flex-1 px-4 pt-6">
        {isPending && <LoadingOverlay />}
        <TextC className="text-2xl font-bold mb-6 text-center">
          Enter League Details
        </TextC>
        {/* League Name Input */}
        <TextC className="text-lg font-semibold mb-2">League Name</TextC>
        <InputField
          control={control}
          name="leagueName"
          placeholder="Enter your league name"
          maxLength={50}
          autoCorrect={false}
          error={errors.leagueName}
        />
        {/* Nickname Input */}
        <TextC className="text-lg font-semibold mt-6 mb-2">Your Nickname</TextC>
        <InputField
          control={control}
          name="nickname"
          placeholder="Enter your nickname for the league"
          autoCorrect={false}
          error={errors.nickname}
        />
        {/* Members Number Selection */}
        <TextC className="text-lg font-semibold mt-6 mb-2">
          Number of Members
        </TextC>
        <View className="flex-row justify-around mb-6">
          <TouchableOpacity
            onPress={() => setMembersCount(6)}
            className={`flex-1 p-4 rounded-lg border-2 mx-2 items-center ${
              membersCount === 6
                ? "border-blue-500 bg-blue-100"
                : "border-gray-200 bg-white"
            }`}
          >
            <Text
              className={`text-lg font-bold ${membersCount === 6 ? "text-blue-700" : "text-gray-800"}`}
            >
              6 Members
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMembersCount(10)}
            className={`flex-1 p-4 rounded-lg border-2 mx-2 items-center ${
              membersCount === 10
                ? "border-blue-500 bg-blue-100"
                : "border-gray-200 bg-white"
            }`}
          >
            <Text
              className={`text-lg font-bold ${membersCount === 10 ? "text-blue-700" : "text-gray-800"}`}
            >
              10 Members
            </Text>
          </TouchableOpacity>
        </View>
        <ButtonC
          title="Create League"
          onPress={handleSubmit(onSubmit)}
          variant="primary"
          size="lg"
          loading={isPending}
          disabled={!isValid}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
