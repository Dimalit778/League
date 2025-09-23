import { Screen } from '@/components/layout';
import { Button, Image, InputField } from '@/components/ui';
import { useCurrentSession } from '@/hooks/useCurrentSession';
import { useFindLeagueByJoinCode, useJoinLeague } from '@/hooks/useLeagues';
import { FoundLeague } from '@/types';

import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from 'react-native';

import * as Yup from 'yup';

const schema = Yup.object().shape({
  inviteCode: Yup.string().min(6).max(6).required('Invite code is required'),
  nickname: Yup.string().min(3).max(20).required('Nickname is required'),
});

export default function JoinLeague() {
  const router = useRouter();
  const { session } = useCurrentSession();
  const userId = session?.user?.id as string;
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
  const [foundLeague, setFoundLeague] = useState<FoundLeague | null>(null);
  const { data, error, isLoading } = useFindLeagueByJoinCode(inviteCodeValue);

  const joinLeague = useJoinLeague(userId);

  useEffect(() => {
    if (data && inviteCodeValue?.length === 6) {
      setFoundLeague(data as FoundLeague);
    } else {
      setFoundLeague(null);
    }
  }, [data, inviteCodeValue]);

  const onClickJoinLeague = async (formData: {
    inviteCode: string;
    nickname: string;
  }) => {
    if (!foundLeague) return;
    joinLeague.mutate(
      {
        join_code: foundLeague.join_code,
        nickname: formData.nickname,
      },
      {
        onSuccess: () => {
          router.replace('/(app)/myLeagues');
        },
        onError: (error: any) => {
          Alert.alert('Error', error?.message || 'Failed to join league');
        },
      }
    );
  };

  return (
    <Screen>
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
            <Text className="text-sm text-muted mt-1 text-center">
              Ask the league admin for the invite code
            </Text>
            {isLoading && (
              <Text className="text-sm text-muted mt-2 text-center">
                Searching for league...
              </Text>
            )}
          </View>
          {/* Preview League Card */}
          {foundLeague && (
            <View className="mb-6">
              {/* League Info Card */}
              <View className="bg-border rounded-xl border border-primary p-4 my-4 gap-4">
                {/* League Name Section */}
                <View className=" flex-row justify-between">
                  <Text className="text-base font-medium text-muted mb-2">
                    League Name :
                  </Text>
                  <Text
                    className="text-2xl font-bold text-primary"
                    numberOfLines={2}
                  >
                    {foundLeague.name}
                  </Text>
                </View>

                {/* Competition Section */}
                <View className="flex-row justify-between">
                  <Text className="text-base font-medium text-muted ">
                    Competition :
                  </Text>
                  <View className="flex-row gap-4 items-center">
                    <Image
                      source={{
                        uri: foundLeague.competition.logo,
                      }}
                      resizeMode="contain"
                      width={24}
                      height={24}
                    />
                    <Text className="text-lg text-text " numberOfLines={1}>
                      {foundLeague.competition.name}
                    </Text>
                  </View>
                </View>

                {/* Country Section */}
                <View className="flex-row justify-between">
                  <Text className="text-base font-medium text-muted ">
                    Country :
                  </Text>
                  <View className="flex-row gap-4 items-center">
                    <Image
                      source={{
                        uri: foundLeague.competition.flag,
                      }}
                      resizeMode="contain"
                      width={24}
                      height={24}
                    />
                    <Text className="text-lg text-text " numberOfLines={1}>
                      {foundLeague.competition.country}
                    </Text>
                  </View>
                </View>
                {/* Member Count */}
                <View className="flex-row justify-between">
                  <Text className="text-base font-medium text-muted ">
                    Members :
                  </Text>
                  <View className="flex-row gap-4 items-center">
                    <Text className="text-lg text-text " numberOfLines={1}>
                      {foundLeague.league_members[0].count} /
                      {foundLeague.max_members}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Input and Button */}
              <View className="mx-4 gap-4">
                <InputField
                  control={control}
                  name="nickname"
                  placeholder="Enter your nickname"
                  error={errors.nickname}
                />
                <Button
                  title="Join League"
                  variant="primary"
                  loading={joinLeague.isPending}
                  onPress={handleSubmit(onClickJoinLeague)}
                  disabled={!isValid}
                />
              </View>
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
            <Text className="text-muted text-md leading-5 ">
              1. Get the 6-digit invite code from the league admin{'\n'}
              2. Enter the code above to find the league{'\n'}
              3. Choose your nickname for the league{'\n'}
              4. Tap "Join League" to become a member
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
