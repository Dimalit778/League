import { Button, Image, InputField } from '@/components/ui';
import { useFindLeagueByJoinCode, useJoinLeague } from '@/hooks/useLeagues';

import { LeagueWithCompetition } from '@/types';

import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import * as Yup from 'yup';

const schema = Yup.object().shape({
  inviteCode: Yup.string().min(6).max(6).required('Invite code is required'),
  nickname: Yup.string().min(3).max(20).required('Nickname is required'),
});

export default function JoinLeague() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });
  const inviteCodeValue = watch('inviteCode');
  const [foundLeague, setFoundLeague] = useState<LeagueWithCompetition | null>(
    null
  );
  const { data, error, isLoading } = useFindLeagueByJoinCode(inviteCodeValue);

  const { mutateAsync, isPending, isSuccess, isError } = useJoinLeague();

  useEffect(() => {
    if (data && inviteCodeValue?.length === 6) {
      setFoundLeague(data as unknown as LeagueWithCompetition);
    } else {
      setFoundLeague(null);
    }
  }, [data, inviteCodeValue]);

  const onClickJoinLeague = async (formData: {
    inviteCode: string;
    nickname: string;
  }) => {
    if (!foundLeague) return;
    await mutateAsync({
      join_code: foundLeague.join_code,
      nickname: formData.nickname,
    });
    router.replace('/(app)/myLeagues');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <View className="flex-1 px-4 pt-6">
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
        {/* Preview League Card */}
        {foundLeague && (
          <View className="mb-6">
            <View className="w-1/2 self-center bg-border rounded-xl border border-primary shadow-sm p-6 mb-6 ">
              <Text
                className="text-3xl font-bold mb-2 text-primary "
                numberOfLines={2}
              >
                {foundLeague.name}
              </Text>
              <View className="gap-3 mt-3">
                <View className="flex-row  items-center gap-3">
                  <Image
                    source={{
                      uri: foundLeague.competitions?.logo,
                    }}
                    resizeMode="contain"
                    width={20}
                    height={20}
                  />
                  <Text className="text-md text-text" numberOfLines={1}>
                    {foundLeague.competitions?.name}
                  </Text>
                </View>

                <View className="flex-row items-center gap-3">
                  <Image
                    source={{
                      uri: foundLeague.competitions?.flag,
                    }}
                    resizeMode="contain"
                    width={20}
                    height={20}
                  />
                  <Text className="text-md text-text" numberOfLines={1}>
                    {foundLeague.competitions?.country}
                  </Text>
                </View>
              </View>
            </View>
            <InputField
              control={control}
              name="nickname"
              placeholder="Enter your nickname"
              error={errors.nickname}
            />
            <Button
              title="Join League"
              variant="primary"
              loading={isPending}
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
            1. Get the 6-digit invite code from the league admin{'\n'}
            2. Enter the code above to find the league{'\n'}
            3. Choose your nickname for the league{'\n'}
            4. Tap "Join League" to become a member
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
