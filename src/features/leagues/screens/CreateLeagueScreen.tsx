import { LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, Button, CText, InputField } from '@/components/ui';
import { useCreateLeague } from '@/features/leagues/hooks/useLeagues';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { yupResolver } from '@hookform/resolvers/yup';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as yup from 'yup';

const schema = yup.object().shape({
  leagueName: yup.string().required('League name is required').min(2, 'League name must be at least 2 characters long'),
  nickname: yup.string().required('Nickname is required').min(2, 'Nickname must be at least 2 characters long'),
});

type MemberOptionProps = {
  value: number;
  label: string;
  disabled?: boolean;
  premium?: boolean;
  membersCount: number | null;
  onSelect: (value: number) => void;
  t: (key: string) => string;
};

const MemberOption = ({ value, label, disabled, premium, membersCount, onSelect, t }: MemberOptionProps) => {
  const isActive = membersCount === value;

  return (
    <Pressable
      onPress={() => {
        if (disabled && premium) {
          router.push('/(app)/(public)/subscription');
          return;
        }
        if (!disabled) onSelect(value);
      }}
      className={`relative flex-1 mx-1 rounded-2xl px-4 py-4 border-2
        ${isActive ? 'border-secondary bg-surface' : 'border-border'}

      `}
    >
      <View className={`${disabled ? 'opacity-30' : ''}`}>
        <CText variant="body" className={`text-center font-semibold ${isActive ? 'text-secondary' : 'text-text'}`}>
          {t(label)}
        </CText>
      </View>

      {premium && (
        <View className="absolute -top-3 left-0 right-0 items-center z-10">
          <View className="bg-yellow-500 px-3 py-1 rounded-md shadow">
            <CText variant="small" bold className="text-black">
              PREMIUM
            </CText>
          </View>
        </View>
      )}
    </Pressable>
  );
};

const CreateLeagueScreen = () => {
  const { competitionId } = useLocalSearchParams();
  const { t } = useTranslation();

  const { mutateAsync: createLeague, isPending } = useCreateLeague();
  const { data: subscription } = useSubscription();
  const limits = subscription?.limits ?? { maxMembersPerLeague: 6 };
  const maxMembersPerLeague = limits.maxMembersPerLeague ?? 6;
  const canSelect10 = maxMembersPerLeague >= 10;
  const [membersCount, setMembersCount] = useState<number | null>(null);

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
    await createLeague({
      league_name: data.leagueName,
      nickname: data.nickname,
      competition_id: Number(competitionId),
      max_members: membersCount ?? maxMembersPerLeague,
    });
  });
  return (
    <Screen withSafeArea>
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
              <MemberOption value={6} label="6 Members" membersCount={membersCount} onSelect={setMembersCount} t={t} />

              <MemberOption
                value={10}
                label="10 Members"
                disabled={!canSelect10}
                premium
                membersCount={membersCount}
                onSelect={setMembersCount}
                t={t}
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

export default CreateLeagueScreen;
