import { Screen } from '@/components/layout';
import { BackButton, Button, InputField } from '@/components/ui';
import { CText } from '@/components/ui/CText';
import { useFindLeagueByJoinCode, useJoinLeague } from '@/features/leagues/hooks/useLeagues';
import { useTranslation } from '@/hooks/useTranslation';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as Yup from 'yup';
import FullLeagueCard from '../components/FullLeagueCard';
const getSchema = (t: (key: string) => string) =>
  Yup.object().shape({
    inviteCode: Yup.string().min(7).max(7).required(t('Invite code is required')),
    nickname: Yup.string().min(3).max(20).required(t('Nickname is required')),
  });

const steps = [
  'Get the 7-digit invite code from the league owner.',
  'Enter the code above to find the league.',
  'Choose your nickname for the league.',
  'Tap "Join League" to become a member.',
];

export default function JoinLeague() {
  const router = useRouter();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(getSchema(t)),
    mode: 'onChange',
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
      router.push('/(app)/(public)/subscription');
      return;
    }

    try {
      await joinLeague.mutateAsync({
        join_code: inviteCodeValue,
        nickname: formData.nickname,
      });
      router.replace('/(app)/(public)/myLeagues');
    } catch (error: any) {
      if (error?.message?.includes('Upgrade')) {
        router.push('/(app)/(public)/subscription');
        return;
      }

      setError('nickname', { type: 'manual', message: error?.message || t('Failed to join league') });
    }
  };

  return (
    <Screen withSafeArea>
      <BackButton title={t('Join League')} />

      <KeyboardAwareScrollView bottomOffset={62} className="flex-1">
        <View className="flex-1 px-4 pt-6">
          <CText variant="h2" className="mb-2 ">
            {t('Invite Code')}
          </CText>

          <View className="mb-6">
            <InputField
              control={control}
              name="inviteCode"
              placeholder={t('Enter 7-digit invite code')}
              maxLength={7}
              autoCorrect={false}
              autoCapitalize="characters"
            />
            <CText variant="caption" className="mt-1 text-center text-muted">
              {t('Ask the league owner for the invite code')}
            </CText>
            {isLoading && (
              <CText variant="caption" className="mt-2 text-center text-muted">
                {t('Searching for league...')}
              </CText>
            )}
          </View>

          {foundLeague && (
            <View className="gap-4">
              <FullLeagueCard league={foundLeague} />
              <View className="mx-4 gap-4">
                {isLeagueFull ? (
                  <View className="gap-3">
                    <CText variant="caption" className="text-center text-muted">
                      {t('This league is full. Upgrade to create larger leagues.')}
                    </CText>
                    <Button
                      title={t('Upgrade')}
                      variant="primary"
                      onPress={() => router.push('/(app)/(public)/subscription')}
                    />
                  </View>
                ) : (
                  <>
                    <InputField
                      control={control}
                      name="nickname"
                      placeholder={t('Enter your nickname')}
                      error={errors.nickname}
                    />
                    <Button
                      title={t('Join League')}
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
              <CText variant="small" className="text-center text-white">
                {t('League not found')}
              </CText>
            </View>
          )}

          {!foundLeague && (
            <View className="mt-8 p-4 bg-surface rounded-xl">
              <CText variant="h2" className="mb-3">
                {t('How to Join a League')}
              </CText>
              <View className="gap-3">
                {steps.map((step, index) => (
                  <View key={index} className="flex-row items-start gap-3">
                    <View className="w-6 h-6 bg-primary rounded-full items-center justify-center mt-0.5">
                      <CText variant="caption" bold>
                        {index + 1}
                      </CText>
                    </View>
                    <CText variant="body" className="text-muted flex-1">
                      {t(step)}
                    </CText>
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
