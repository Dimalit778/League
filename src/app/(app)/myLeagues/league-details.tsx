import { LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, Button, InputField } from '@/components/ui';
import { useCreateLeague } from '@/hooks/useLeagues';
import { yupResolver } from '@hookform/resolvers/yup';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as yup from 'yup';

const schema = yup.object().shape({
  leagueName: yup
    .string()
    .required('League name is required')
    .min(2, 'League name must be at least 3 characters long'),
  nickname: yup
    .string()
    .required('Nickname is required')
    .min(2, 'Nickname must be at least 2 characters long'),
});

export default function EnterLeagueDetailsScreen() {
  const { competitionId, leagueLogo } = useLocalSearchParams();
  const createLeagueMutation = useCreateLeague();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<{
    leagueName: string;
    nickname: string;
  }>({
    defaultValues: {
      leagueName: '',
      nickname: '',
    },
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const [membersCount, setMembersCount] = useState<number | null>(null);

  const onSubmit = async (data: { leagueName: string; nickname: string }) => {
    try {
      const leagueData = await createLeagueMutation.mutateAsync({
        name: data.leagueName,
        competition_id: Number(competitionId),
        max_members: membersCount || 6,
        nickname: data.nickname,
      });
      if (leagueData) {
        router.push({
          pathname: '/(app)/myLeagues/league-created',
          params: { leagueId: leagueData.id },
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Screen>
      <BackButton />
      <KeyboardAvoidingView
        className="flex-1 bg-background px-3 "
        behavior="padding"
      >
        {createLeagueMutation.isPending && <LoadingOverlay />}

        <Text className="text-2xl font-bold mb-6 text-center text-text">
          Enter League Details
        </Text>
        {/* League Name Input */}
        <Text className="text-lg font-semibold mb-2 text-text">
          League Name
        </Text>
        <InputField
          control={control}
          name="leagueName"
          placeholder="Enter your league name"
          maxLength={50}
          autoCorrect={false}
          autoCapitalize="words"
          error={errors.leagueName}
        />
        {/* Nickname Input */}
        <Text className="text-lg font-semibold mt-6 mb-2 text-text">
          Your Nickname
        </Text>
        <InputField
          control={control}
          name="nickname"
          placeholder="Enter your nickname for the league"
          autoCorrect={false}
          autoCapitalize="words"
          error={errors.nickname}
        />
        {/* Members Number Selection */}
        <Text className="text-lg font-semibold mt-6 mb-2 text-text">
          Number of Members
        </Text>
        <View className="flex-row justify-around mb-6">
          <TouchableOpacity
            onPress={() => setMembersCount(6)}
            className={`flex-1 p-4 rounded-lg border-2 mx-2 items-center ${
              membersCount === 6
                ? 'border-secondary bg-surface border-2'
                : 'border-border border-2'
            }`}
          >
            <Text
              className={`text-lg font-bold ${membersCount === 6 ? 'text-secondary' : 'text-text'}`}
            >
              6 Members
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMembersCount(10)}
            className={`flex-1 p-4 rounded-lg  mx-2 items-center ${
              membersCount === 10
                ? 'border-secondary bg-surface border-2'
                : 'border-border border-2'
            }`}
          >
            <Text
              className={`text-lg font-bold ${membersCount === 10 ? 'text-secondary' : 'text-text'}`}
            >
              10 Members
            </Text>
          </TouchableOpacity>
        </View>
        <Button
          title="Create League"
          onPress={handleSubmit(onSubmit)}
          variant="primary"
          size="lg"
          loading={createLeagueMutation.isPending}
          disabled={!isValid}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}
