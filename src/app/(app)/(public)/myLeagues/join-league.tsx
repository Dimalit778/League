import { BackButton, Button, InputField, MyImage } from '@/components/ui';
import { useCurrentSession } from '@/hooks/useCurrentSession';
import { useFindLeagueByJoinCode, useJoinLeague } from '@/hooks/useLeagues';

import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';

const schema = Yup.object().shape({
  inviteCode: Yup.string().min(7).max(7).required('Invite code is required'),
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
  const [foundLeague, setFoundLeague] = useState<LeagueWithCompetition | null>(null);
  const { data, error, isLoading } = useFindLeagueByJoinCode(inviteCodeValue);

  const joinLeague = useJoinLeague(userId);

  useEffect(() => {
    if (data && inviteCodeValue?.length === 7) {
      setFoundLeague(data as LeagueWithCompetition);
    } else {
      setFoundLeague(null);
    }
  }, [data, inviteCodeValue]);

  const onClickJoinLeague = async (formData: { inviteCode: string; nickname: string }) => {
    if (!foundLeague) return;
    try {
      await joinLeague.mutateAsync({
        join_code: foundLeague.join_code,
        nickname: formData.nickname,
      });
      router.replace('/(app)/(public)/myLeagues');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to join league');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background">
        <View className="flex-1 px-4 pt-6">
          <View className="mb-6">
            <Text className="text-lg font-semibold text-text mb-2">Invite Code</Text>
            <InputField
              control={control}
              name="inviteCode"
              placeholder="Enter 7-digit invite code"
              maxLength={7}
              autoCorrect={false}
              autoCapitalize="characters"
              error={errors.inviteCode}
            />
            <Text className="text-sm text-muted mt-1 text-center">Ask the league admin for the invite code</Text>
            {isLoading && <Text className="text-sm text-muted mt-2 text-center">Searching for league...</Text>}
          </View>
          {/* Preview League Card */}
          {foundLeague && (
            <View className="bg-surface p-4 mx-3 border border-border rounded-2xl">
              <View className="items-center mb-6">
                <MyImage source={foundLeague?.competition?.logo} width={80} height={80} resizeMode="contain" />
                <Text className="text-2xl font-bold text-center text-text mb-2 ">{foundLeague?.name}</Text>
                <Text className="text-base text-muted text-center">
                  {foundLeague?.competition?.area} • {foundLeague?.competition?.name}
                </Text>
              </View>
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

          {error && !foundLeague && !isLoading && inviteCodeValue?.length === 7 && (
            <View className="mb-6 p-4 bg-error border border-error rounded-xl">
              <Text className="text-error text-center">No league found with this invite code</Text>
            </View>
          )}

          {/* How it Works */}
          <View className=" mt-8 p-4 bg-surface rounded-xl">
            <Text className="text-lg font-semibold text-text mb-2 text-center">How to Join a League</Text>
            <Text className="text-muted text-md leading-5 ">
              1. Get the 7-digit invite code from the league admin{'\n'}
              2. Enter the code above to find the league{'\n'}
              3. Choose your nickname for the league{'\n'}
              4. Tap "Join League" to become a member
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
