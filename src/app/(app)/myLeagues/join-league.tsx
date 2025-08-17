import PreviewLeagueCard from "@/components/myLeagues/PreviewLeagueCard";
import { Button, InputField } from "@/components/ui";
import { useFindLeagueByJoinCode, useJoinLeague } from "@/hooks/useLeagues";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import * as Yup from "yup";

const schema = Yup.object().shape({
  inviteCode: Yup.string().min(6).max(6).required("Invite code is required"),
  nickname: Yup.string().min(3).max(20).required("Nickname is required"),
});

export default function JoinLeague() {
  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });
  const inviteCodeValue = watch("inviteCode");
  const [searchingLeague, setSearchingLeague] = useState(false);
  const [foundLeague, setFoundLeague] = useState<any | null>(null);
  const { data, error, isLoading } = useFindLeagueByJoinCode(inviteCodeValue);
  const joinLeagueMutation = useJoinLeague();

  useEffect(() => {
    if (data && inviteCodeValue?.length === 6) {
      setFoundLeague(data);
    } else {
      setFoundLeague(null);
    }
  }, [data, inviteCodeValue]);

  const onClickJoinLeague = async (formData: {
    inviteCode: string;
    nickname: string;
  }) => {
    if (!foundLeague) return;

    try {
      setSearchingLeague(true);
      await joinLeagueMutation.mutateAsync({
        leagueId: foundLeague.id,
        nickname: formData.nickname,
      });

      Alert.alert("Success", "You have successfully joined the league");
      router.replace("/(app)/myLeagues");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to join league");
    } finally {
      setSearchingLeague(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView className="flex-1 px-4 pt-6">
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text mb-2">
            Invite Code
          </Text>
          <InputField
            control={control}
            name="inviteCode"
            placeholder="Enter 6-digit invite code"
            maxLength={6}
            autoCorrect={false}
            autoCapitalize="characters"
            error={errors.inviteCode}
          />
          <Text className="text-sm text-textMuted mt-1 text-center">
            Ask the league admin for the invite code
          </Text>
          {isLoading && (
            <Text className="text-sm text-textMuted mt-2 text-center">
              Searching for league...
            </Text>
          )}
        </View>

        {foundLeague && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-text mb-3">
              League Found
            </Text>
            <PreviewLeagueCard data={foundLeague} />
            <InputField
              control={control}
              name="nickname"
              placeholder="Enter your nickname"
              error={errors.nickname}
            />
            <Button
              title="Join League"
              variant="primary"
              loading={searchingLeague}
              onPress={handleSubmit(onClickJoinLeague)}
              disabled={!isValid}
            />
          </View>
        )}

        {error &&
          !foundLeague &&
          !isLoading &&
          inviteCodeValue?.length === 6 && (
            <View className="mb-6 p-4 bg-error border border-error rounded-xl">
              <Text className="text-error text-center">
                No league found with this invite code
              </Text>
            </View>
          )}

        {/* How it Works */}
        <View className="mb-6 p-4 bg-surface rounded-xl">
          <Text className="text-lg font-semibold text-text mb-2 text-center">
            How to Join a League
          </Text>
          <Text className="text-textMuted text-md leading-5 ">
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
