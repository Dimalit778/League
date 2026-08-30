import { Button, InputField, LoadingOverlay, Row, Screen, Text } from '@/components';
import MemberOption from '@/features/leagues/components/createLeague/MemberOption';
import { useCreateLeague } from '@/features/leagues/hooks/useLeagues';
import { useEnsureProAccess } from '@/features/subscription/hooks/useEnsureProAccess';
import { useTranslation } from '@/hooks/useTranslation';
import { spacing } from '@/lib/nativewind/spacing';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as yup from 'yup';

const schema = yup.object().shape({
  leagueName: yup
    .string()
    .trim()
    .required('League name is required')
    .min(2, 'League name must be at least 2 characters long')
    .max(20, 'League name must be at most 20 characters long'),
  nickname: yup
    .string()
    .trim()
    .required('Nickname is required')
    .min(2, 'Nickname must be at least 2 characters long')
    .max(20, 'Nickname must be at most 20 characters long'),
});

const DEFAULT_MEMBERS_COUNT = 6;

const LeagueDetailsScreen = () => {
  const { competitionId } = useLocalSearchParams();
  const { t } = useTranslation();
  const { isPro, openPaywall, ensureProAccess } = useEnsureProAccess();
  const { mutateAsync: createLeague, isPending } = useCreateLeague();

  const [membersCount, setMembersCount] = useState(DEFAULT_MEMBERS_COUNT);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLockedOptionPress = async () => {
    setIsProcessing(true);
    try {
      const purchased = await openPaywall();
      if (purchased) {
        setMembersCount(12);
      }
    } finally {
      setIsProcessing(false);
    }
  };

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

  const onSubmit = handleSubmit(async (data) => {
    if (membersCount === 12) {
      setIsProcessing(true);
      let allowed = false;
      try {
        allowed = await ensureProAccess();
      } finally {
        setIsProcessing(false);
      }
      if (!allowed) {
        Alert.alert(
          t('Subscription not confirmed'),
          t('We could not confirm your PRO subscription. Please try again in a moment.'),
        );
        return;
      }
    }

    try {
      await createLeague({
        league_name: data.leagueName,
        nickname: data.nickname,
        competition_id: Number(competitionId),
        max_members: membersCount,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : t('Failed to create league');
      Alert.alert(t('Error'), message);
    }
  });

  return (
    <>
      <Screen padding="horizontal" edges={['bottom']}>
        {(isPending || isProcessing) && <LoadingOverlay />}
        <View className="flex-1">
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            bottomOffset={72}
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: 8,
            }}
          >
            {/* League name */}
            <View className="mb-8 gap-2">
              <Row>
                <Text variant="title" size="lg">{t('League Name')}</Text>
              </Row>
              <InputField
                control={control}
                name="leagueName"
                placeholder={t('Enter league name')}
                maxLength={20}
                autoCorrect={false}
                autoCapitalize="words"
                error={errors.leagueName}
              />
            </View>

            {/* Nickname */}
            <View className="mb-8 gap-2">
              <Row>
                <Text variant="title" size="lg">{t('Your Nickname')}</Text>
              </Row>
              <InputField
                control={control}
                name="nickname"
                placeholder={t('Enter your nickname')}
                maxLength={20}
                autoCorrect={false}
                autoCapitalize="words"
                error={errors.nickname}
              />
            </View>

            {/* Members count */}

            <Text variant="body" tone="muted" className="text-center">
              {t('Choose how many friends can join this league.')}
            </Text>

            <View className="flex-row mt-8">
              <MemberOption
                value={6}
                label={t('6 Members')}
                locked={false}
                membersCount={membersCount}
                onSelect={setMembersCount}
                onLockedPress={handleLockedOptionPress}
              />

              <MemberOption
                value={12}
                label={t('12 Members')}
                locked={!isPro}
                membersCount={membersCount}
                onSelect={setMembersCount}
                onLockedPress={handleLockedOptionPress}
              />
            </View>
          </KeyboardAwareScrollView>

          {/* Fixed bottom button */}
          <View className={spacing.screen}>
            <Button
              label={t('Create League')}
              onPress={onSubmit}
              variant="primary"
              size="lg"
              disabled={!isValid || isPending || isProcessing}
            />
          </View>
        </View>
      </Screen>
    </>
  );
};

export default LeagueDetailsScreen;
