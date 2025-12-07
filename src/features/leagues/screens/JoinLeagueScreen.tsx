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
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import FullLeagueCard from '../components/FullLeagueCard';

const getSchema = (t: (key: string) => string) =>
  Yup.object().shape({
    inviteCode: Yup.string().min(7).max(7).required(t('Invite code is required')),
    nickname: Yup.string().min(3).max(20).required(t('Nickname is required')),
  });

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
      setError('nickname', { type: 'manual', message: error?.message || t('Failed to join league') });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton title={t('Join League')} />

      <KeyboardAwareScrollView bottomOffset={62} className="flex-1">
        <View className="flex-1 px-4 pt-6">
          <CText className="text-lg font-semibold text-text mb-2 ">{t('Invite Code')}</CText>

          <View className="mb-6">
            <InputField
              control={control}
              name="inviteCode"
              placeholder={t('Enter 7-digit invite code')}
              maxLength={7}
              autoCorrect={false}
              autoCapitalize="characters"
              error={errors.inviteCode}
            />
            <CText className="text-sm text-muted mt-1 text-center ">
              {t('Ask the league owner for the invite code')}
            </CText>
            {isLoading && <CText className="text-sm text-muted mt-2 text-center">{t('Searching for league...')}</CText>}
          </View>

          {foundLeague && (
            <View className="gap-4">
              <FullLeagueCard league={foundLeague} />
              <View className="mx-4 gap-4">
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
              </View>
            </View>
          )}

          {error && !foundLeague && !isLoading && inviteCodeValue?.length === 7 && (
            <View className="mb-6 p-4 bg-red-500 border border-error rounded-xl">
              <CText className="text-text text-center font-bold">{t('League not found')}</CText>
            </View>
          )}

          {!foundLeague && (
            <View className=" mt-8 p-4 bg-surface rounded-xl">
              <CText className="text-lg font-semibold text-text mb-2 text-center">{t('How to Join a League')}</CText>
              <CText className="flex-col leading-6 text-left">
                <CText className="text-muted font-bold">
                  {t('1. Get the 7-digit invite code from the league owner.')}
                </CText>
                {'\n'}
                <CText className="text-muted font-bold">{t('2. Enter the code above to find the league.')}</CText>
                {'\n'}
                <CText className="text-muted font-bold">{t('3. Choose your nickname for the league.')}</CText>
                {'\n'}
                <CText className="text-muted font-bold">{t('4. Tap "Join League" to become a member.')}</CText>
                {'\n'}
              </CText>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
