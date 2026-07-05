import { LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, Button, CText, InputField } from '@/components/ui';
import MemberOption from '@/features/leagues/components/createLeague/MemberOption';
import { useCreateLeague } from '@/features/leagues/hooks/useLeagues';
import { useEnsureProAccess } from '@/features/subscription/hooks/useEnsureProAccess';
import { useTranslation } from '@/hooks/useTranslation';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as yup from 'yup';

const schema = yup.object().shape({
  leagueName: yup.string().required('League name is required').min(2, 'League name must be at least 2 characters long'),
  nickname: yup.string().required('Nickname is required').min(2, 'Nickname must be at least 2 characters long'),
});

const DEFAULT_MEMBERS_COUNT = 6;

const LeagueDetailsScreen = () => {
  const { competitionId } = useLocalSearchParams();
  const { t } = useTranslation();
  const { isPro, openPaywall, ensureProAccess } = useEnsureProAccess();
  const { mutateAsync: createLeague, isPending } = useCreateLeague();

  const [membersCount, setMembersCount] = useState(DEFAULT_MEMBERS_COUNT);

  const handleLockedOptionPress = async () => {
    const purchased = await openPaywall();
    if (purchased) {
      setMembersCount(12);
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
      const allowed = await ensureProAccess();
      if (!allowed) return;
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
    <Screen edges={['top', 'bottom']}>
      {isPending && <LoadingOverlay />}
      <BackButton title={t('League Details')} />
      <View className="flex-1 ">
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
          <View className="mb-8">
            <CText variant="body" className="mb-2 text-left">
              {t('League Name')}
            </CText>
            <InputField
              control={control}
              name="leagueName"
              placeholder={t('Enter league name')}
              maxLength={50}
              autoCorrect={false}
              autoCapitalize="words"
              error={errors.leagueName}
            />
          </View>

          {/* Nickname */}
          <View className="mb-8">
            <CText variant="body" className="mb-2 text-left">
              {t('Your Nickname')}
            </CText>
            <InputField
              control={control}
              name="nickname"
              placeholder={t('Enter your nickname')}
              autoCorrect={false}
              autoCapitalize="words"
              error={errors.nickname}
            />
          </View>

          {/* Members count */}
          <View>
            <CText variant="body" className="mb-2 text-left">
              {t('Number of Members')}
            </CText>
            <CText variant="caption" className="text-muted mb-3 text-center">
              {t('Choose how many friends can join this league.')}
            </CText>

            <View className="flex-row mt-4">
              <MemberOption
                value={6}
                label="6 Members"
                locked={false}
                membersCount={membersCount}
                onSelect={setMembersCount}
                onLockedPress={handleLockedOptionPress}
              />

              <MemberOption
                value={12}
                label="12 Members"
                locked={!isPro}
                membersCount={membersCount}
                onSelect={setMembersCount}
                onLockedPress={handleLockedOptionPress}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>

        {/* Fixed bottom button */}
        <View className="px-4 pb-5 pt-2 bg-background">
          <Button
            title={t('Create League')}
            onPress={onSubmit}
            variant="primary"
            size="lg"
            disabled={!isValid || isPending}
          />
        </View>
      </View>
    </Screen>
  );
};

export default LeagueDetailsScreen;
