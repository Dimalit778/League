import { LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, Button, InputField } from '@/components/ui';
import { useCreateLeague } from '@/hooks/useLeagues';
import { useSubscription } from '@/hooks/useSubscription';
import { subscriptionService } from '@/services/subscriptionService';
import { useMemberStore } from '@/store/MemberStore';
import { yupResolver } from '@hookform/resolvers/yup';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
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
  const { competitionId } = useLocalSearchParams();
  const { member } = useMemberStore();
  const { data: subscription, isLoading: isLoadingSubscription } =
    useSubscription();

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
  const createLeague = useCreateLeague();

  // Get subscription limits
  const subscriptionType = subscription?.subscription_type || 'FREE';
  const limits = subscriptionService.getSubscriptionLimits(subscriptionType);

  // Check if user can create more leagues
  useEffect(() => {
    const checkCanCreateLeague = async () => {
      if (!member?.user_id) return;

      try {
        const { canCreate, reason } = await subscriptionService.canCreateLeague(
          member.user_id
        );

        if (!canCreate) {
          Alert.alert(
            'Subscription Limit Reached',
            reason ||
              "You've reached your league limit. Please upgrade your subscription to create more leagues.",
            [
              {
                text: 'Upgrade Subscription',
                onPress: () => router.push('/(app)/subscription'),
              },
              {
                text: 'Cancel',
                onPress: () => router.back(),
                style: 'cancel',
              },
            ]
          );
        }
      } catch (error) {
        console.error('Error checking if user can create league:', error);
      }
    };

    checkCanCreateLeague();
  }, [member?.user_id]);

  const onSubmit = handleSubmit((data) =>
    createLeague.mutate({
      ...data,
      competition_id: Number(competitionId),
      max_members: membersCount || 6,
      user_id: member?.id as string,
    })
  );

  return (
    <Screen>
      <BackButton />
      <KeyboardAvoidingView
        className="flex-1 bg-background px-3 "
        behavior="padding"
      >
        {createLeague.isPending && <LoadingOverlay />}

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
        <View className="flex-row justify-around mb-2">
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
            disabled={limits.maxMembersPerLeague < 10}
            className={`flex-1 p-4 rounded-lg mx-2 items-center ${
              membersCount === 10
                ? 'border-secondary bg-surface border-2'
                : limits.maxMembersPerLeague < 10
                  ? 'border-border border-2 opacity-50'
                  : 'border-border border-2'
            }`}
          >
            <Text
              className={`text-lg font-bold ${
                membersCount === 10
                  ? 'text-secondary'
                  : limits.maxMembersPerLeague < 10
                    ? 'text-textMuted'
                    : 'text-text'
              }`}
            >
              10 Members
            </Text>
          </TouchableOpacity>
        </View>

        {limits.maxMembersPerLeague < 10 && (
          <Text className="text-textMuted text-sm text-center mb-4">
            Upgrade to Premium to create leagues with up to 10 members
          </Text>
        )}
        <Button
          title="Create League"
          onPress={onSubmit}
          variant="primary"
          size="lg"
          loading={createLeague.isPending}
          disabled={!isValid}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}
