import { LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, Button, InputField } from '@/components/ui';
import { useCreateLeague } from '@/features/leagues/hooks/useLeagues';
import { useAuthStore } from '@/store/AuthStore';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as yup from 'yup';

const schema = yup.object().shape({
  leagueName: yup.string().required('League name is required').min(2, 'League name must be at least 3 characters long'),
  nickname: yup.string().required('Nickname is required').min(2, 'Nickname must be at least 2 characters long'),
});

const CreateLeagueScreen = () => {
  const { competitionId } = useLocalSearchParams();
  const userId = useAuthStore((state) => state.userId);
  const { mutateAsync: createLeague, isPending } = useCreateLeague(userId ?? '');
  const [membersCount, setMembersCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const MemberOption = ({ value, label }: { value: number; label: string }) => {
    const isActive = membersCount === value;
    return (
      <TouchableOpacity
        onPress={() => setMembersCount(value)}
        className={`flex-1 mx-1 rounded-xl px-4 py-3 items-center border-2 ${
          isActive ? 'border-secondary bg-surface' : 'border-border'
        }`}
        activeOpacity={0.8}
      >
        <Text className={`text-base font-bold ${isActive ? 'text-secondary' : 'text-text'}`}>{label}</Text>
      </TouchableOpacity>
    );
  };
  const onSubmit = handleSubmit(async (data) => {
    await createLeague({
      league_name: data.leagueName,
      nickname: data.nickname,
      competition_id: Number(competitionId),
      max_members: membersCount ?? 6,
      user_id: userId!,
    });
  });
  return (
    <Screen>
      {isPending && <LoadingOverlay />}
      <BackButton title="League Details" textColor="text-primary" />
      <View className="flex-1">
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          bottomOffset={72}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 24,
          }}
        >
          {/* League name */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-2 text-text">League Name</Text>
            <InputField
              control={control}
              name="leagueName"
              placeholder="Enter league name"
              maxLength={50}
              autoCorrect={false}
              autoCapitalize="words"
              error={errors.leagueName}
            />
          </View>

          {/* Nickname */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-2 text-text">Your Nickname</Text>
            <InputField
              control={control}
              name="nickname"
              placeholder="Enter your nickname"
              autoCorrect={false}
              autoCapitalize="words"
              error={errors.nickname}
            />
          </View>

          {/* Members count */}
          <View className="mb-4">
            <Text className="text-lg font-semibold mb-2 text-text">Number of Members</Text>
            <Text className="text-xs text-muted mb-3">Choose how many friends can join this league.</Text>

            <View className="flex-row">
              <MemberOption value={6} label="6 Members" />
              <MemberOption value={10} label="10 Members" />
            </View>
          </View>
          {error && <Text className="text-red-500 text-center text-sm ">{error}</Text>}
        </KeyboardAwareScrollView>

        {/* Fixed bottom button */}
        <View className="px-4 pb-5 pt-2 bg-background">
          <Button
            title="Create League"
            onPress={onSubmit}
            variant="primary"
            size="lg"
            disabled={!isValid || isPending || !!error}
          />
        </View>
      </View>
    </Screen>
  );
};

export default CreateLeagueScreen;
