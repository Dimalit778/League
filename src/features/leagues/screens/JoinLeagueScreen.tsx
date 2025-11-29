import { BackButton, Button, InputField } from '@/components/ui';
import { useFindLeagueByJoinCode, useJoinLeague } from '@/features/leagues/hooks/useLeagues';
import { useAuth } from '@/providers/AuthProvider';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import FullLeagueCard from '../components/FullLeagueCard';

const schema = Yup.object().shape({
  inviteCode: Yup.string().min(7).max(7).required('Invite code is required'),
  nickname: Yup.string().min(3).max(20).required('Nickname is required'),
});

export default function JoinLeague() {
  const router = useRouter();
  const { session } = useAuth();

  const userId = session?.user?.id as string;
  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });
  const inviteCodeValue = watch('inviteCode');
  const { data, error, isLoading } = useFindLeagueByJoinCode(inviteCodeValue);

  const [foundLeague, setFoundLeague] = useState<typeof data | null>(null);

  const joinLeague = useJoinLeague(userId);

  useEffect(() => {
    if (data && inviteCodeValue?.length === 7) {
      setFoundLeague(data);
    } else if (inviteCodeValue?.length === 7 && !isLoading && !data) {
      setFoundLeague(null);
    } else {
      setFoundLeague(null);
    }
  }, [data, inviteCodeValue, isLoading]);

  const onClickJoinLeague = async (formData: { inviteCode: string; nickname: string }) => {
    if (!foundLeague) return;
    try {
      await joinLeague.mutateAsync({
        join_code: inviteCodeValue,
        nickname: formData.nickname,
      });
      router.replace('/(app)/(public)/myLeagues');
    } catch (error: any) {
      setError('nickname', { type: 'manual', message: error?.message || 'Failed to join league' });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton title="Join League" />

      <KeyboardAwareScrollView bottomOffset={62} className="flex-1">
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

          {foundLeague && (
            <View className="gap-4">
              <FullLeagueCard league={foundLeague} />
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
            <View className="mb-6 p-4 bg-red-500 border border-error rounded-xl">
              <Text className="text-text text-center font-bold">League not found</Text>
            </View>
          )}

          {!foundLeague && (
            <View className=" mt-8 p-4 bg-surface rounded-xl">
              <Text className="text-lg font-semibold text-text mb-2 text-center">How to Join a League</Text>
              <Text className="text-muted text-md leading-5 ">
                1. Get the 7-digit invite code from the league admin{'\n'}
                2. Enter the code above to find the league{'\n'}
                3. Choose your nickname for the league{'\n'}
                4. Tap "Join League" to become a member
              </Text>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
