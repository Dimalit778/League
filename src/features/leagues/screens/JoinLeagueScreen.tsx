import { Button, InputField, LogoBadge, MyImage, Screen, Text } from '@/components';
import { useFindLeagueByJoinCode, useJoinLeague } from '@/features/leagues/hooks/useLeagues';
import { useTranslation } from '@/hooks/useTranslation';
import { usePaywall } from '@/lib/revenuecat/purchases';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as Yup from 'yup';
import { FullLeague } from '../types';

const getSchema = (t: (key: string) => string) =>
  Yup.object().shape({
    inviteCode: Yup.string()
      .trim()
      .matches(/^[A-Za-z0-9]{7}$/, t('Invite code is required'))
      .required(t('Invite code is required')),
    nickname: Yup.string().trim().min(2).max(20).required(t('Nickname is required')),
  });

const steps = [
  'Get the 7-digit invite code from the league owner.',
  'Enter the code above to find the league.',
  'Choose your nickname for the league.',
  'Tap "Join League" to become a member.',
];

const FullLeagueCard = ({ league }: { league: FullLeague }) => {
  const { t } = useTranslation();
  return (
    <View className="bg-border rounded-2xl p-4 mx-5">
      <View className="items-center gap-2">
        <LogoBadge source={league.competition_logo} width={80} height={80} />

        <Text
          className="text-primary font-bold text-2xl text-center uppercase"
          style={{
            letterSpacing: 1,
          }}
        >
          {league.league_name}
        </Text>
      </View>

      <View className="h-[1px] bg-muted my-3" />

      <View className="gap-3">
        <View>
          <View className="flex-row justify-between ">
            <Text className="text-text">{t('Members')}</Text>
            <Text className="text-text font-semibold">
              {league.members_count || 0} / {league.max_members}
            </Text>
          </View>
        </View>
        <View className="h-[1px] bg-muted" />
        {/* Owner */}
        <View className="flex-row justify-between">
          <Text className="text-text">{t('League Owner')}</Text>
          <Text className="text-text font-semibold">{league.owner_nickname}</Text>
        </View>
        <View className="h-[1px] bg-muted" />
        {/* Competition details */}
        <View className="flex-row justify-between">
          <Text className="text-text">{t('League')}</Text>
          <View className="flex-row items-center">
            <Text className="text-text font-semibold mr-2">{league.competition_name}</Text>
            <LogoBadge source={{ uri: league.competition_logo }} width={18} height={18} />
          </View>
        </View>
        <View className="h-[1px] bg-muted" />
        <View className="flex-row justify-between items-center pb-1">
          <Text className="text-text">{t('Country')}</Text>
          <View className="flex-row items-center">
            <Text className="text-text font-semibold mr-2">{league.competition_area}</Text>
            {league.competition_flag && (
              <MyImage source={league.competition_flag} width={18} height={18} contentFit="contain" />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
export default function JoinLeagueScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const openPaywall = usePaywall();
  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(getSchema(t)),
    mode: 'onChange',
    defaultValues: {
      inviteCode: '',
      nickname: '',
    },
  });
  const inviteCodeValue = watch('inviteCode');
  const { data, error, isLoading } = useFindLeagueByJoinCode(inviteCodeValue);
  const [foundLeague, setFoundLeague] = useState<typeof data | null>(null);

  const joinLeague = useJoinLeague();
  const isLeagueFull = !!foundLeague && foundLeague.members_count >= foundLeague.max_members;

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
    if (isLeagueFull) {
      openPaywall();
      return;
    }

    try {
      await joinLeague.mutateAsync({
        join_code: inviteCodeValue,
        nickname: formData.nickname,
      });
      router.replace('/(app)/(user)/leagues/my-leagues');
    } catch (error: any) {
      if (error?.message?.includes('Upgrade')) {
        openPaywall();
        return;
      }

      setError('nickname', { type: 'manual', message: error?.message || t('Failed to join league') });
    }
  };

  return (
    <Screen edges={['bottom']}>
      <KeyboardAwareScrollView bottomOffset={62} className="flex-1">
        <View className="flex-1 px-4 pt-6">
          <Text className="text-2xl mb-2">
            {t('Invite Code')}
          </Text>

          <View className="mb-6">
            <InputField
              control={control}
              name="inviteCode"
              placeholder={t('Enter 7-digit invite code')}
              maxLength={7}
              autoCorrect={false}
              autoCapitalize="characters"
            />
            <Text className="mt-1 text-center ">{t('Ask the league owner for the invite code')}</Text>
            {isLoading && (
              <Text className="text-sm mt-2 text-center text-muted">
                {t('Searching for league...')}
              </Text>
            )}
          </View>

          {foundLeague && (
            <View className="gap-4">
              <FullLeagueCard league={foundLeague} />
              <View className="mx-4 gap-4">
                {isLeagueFull ? (
                  <View className="gap-3">
                    <Text className="text-sm text-center text-muted">
                      {t('This league is full. Upgrade to create larger leagues.')}
                    </Text>
                    <Button label={t('Upgrade')} variant="primary" onPress={openPaywall} />
                  </View>
                ) : (
                  <>
                    <InputField
                      control={control}
                      name="nickname"
                      placeholder={t('Enter your nickname')}
                      maxLength={20}
                      error={errors.nickname}
                    />
                    <Button
                      label={t('Join League')}
                      variant="primary"
                      loading={joinLeague.isPending}
                      onPress={handleSubmit(onClickJoinLeague)}
                      disabled={!isValid}
                    />
                  </>
                )}
              </View>
            </View>
          )}

          {error && !foundLeague && !isLoading && inviteCodeValue?.length === 7 && (
            <View className="mb-6 p-2 bg-error border border-error rounded-xl">
              <Text className="text-xs text-center text-white">
                {t('League not found')}
              </Text>
            </View>
          )}

          {!foundLeague && (
            <View className="mt-8 p-4 bg-surface rounded-xl">
              <Text className="text-2xl mb-3">
                {t('How to Join a League')}
              </Text>
              <View className="gap-3">
                {steps.map((step, index) => (
                  <View key={index} className="flex-row items-start gap-3">
                    <View className="w-6 h-6 bg-primary rounded-full items-center justify-center mt-0.5">
                      <Text className="text-sm font-bold">
                        {index + 1}
                      </Text>
                    </View>
                    <Text className="text-base text-muted flex-1">
                      {t(step)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}
