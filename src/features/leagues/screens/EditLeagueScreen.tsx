import { Error, LoadingOverlay } from '@/components/layout';
import { useGetLeagueAndMembers, useRemoveMember, useUpdateLeague } from '@/features/leagues/hooks/useLeagues';
import { usePrimaryMember } from '@/features/members/hooks/useMembers';
import { useMemberStore } from '@/store/MemberStore';

import { Screen } from '@/components/layout';
import { AvatarImage, BackButton, Button, CText } from '@/components/ui';
import { LogoBadge } from '@/components/ui/LogoBadge';
import { MemberType } from '@/features/members/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useEffect, useMemo, useState } from 'react';
import { Alert, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

type MemberCardProps = {
  member: MemberType;
  isOwner: boolean;
  handleRemoveMember: (memberId: string, nickname: string) => void;
};

const MemberCard = ({ member, isOwner, handleRemoveMember }: MemberCardProps) => {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center justify-between py-3 px-2 bg-surface rounded-lg border border-border">
      <View className="flex-row items-center flex-1">
        <View className="mr-3 w-10 h-10 rounded-full overflow-hidden">
          <AvatarImage nickname={member.nickname} path={member.avatar_url ?? null} />
        </View>
        <View className="flex-1 items-start">
          <CText className="text-text font-medium">{member.nickname}</CText>
          {isOwner && <CText className="text-muted text-xs">{t('League Owner')}</CText>}
        </View>
      </View>
      {!isOwner && (
        <Button
          title={t('Remove')}
          size="sm"
          variant="error"
          onPress={() => handleRemoveMember(member.id, member.nickname)}
        />
      )}
    </View>
  );
};
export default function EditLeagueScreen() {
  const { data: primaryMember } = usePrimaryMember();
  const leagueId = useMemberStore((s) => s.leagueId);
  const { t } = useTranslation();
  const { data: league, isLoading, error } = useGetLeagueAndMembers(leagueId!);

  const removeMember = useRemoveMember();
  const updateLeague = useUpdateLeague();

  const sortedMembers = useMemo(() => {
    return [...(league?.league_members ?? [])].sort((a, b) => {
      const aIsOwner = a.user_id === league?.owner_id;
      const bIsOwner = b.user_id === league?.owner_id;
      if (aIsOwner && !bIsOwner) return -1;
      if (!aIsOwner && bIsOwner) return 1;
      return 0;
    });
  }, [league?.league_members, league?.owner_id]);

  const [editedLeagueName, setEditedLeagueName] = useState('');

  useEffect(() => {
    if (league?.name) {
      setEditedLeagueName(league.name);
    }
  }, [league?.name]);

  const handleRemoveMember = async (memberId: string, nickname: string) => {
    if (!leagueId || primaryMember?.user_id !== league?.owner_id) return;
    Alert.alert(t('Remove Member'), `${t('Remove')} ${nickname} ${t('from this league')}?`, [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Remove'),
        style: 'destructive',
        onPress: async () => {
          await removeMember.mutateAsync(memberId);
        },
      },
    ]);
  };
  const trimmedLeagueName = editedLeagueName.trim();
  const canSaveLeagueName = league && trimmedLeagueName.length > 0 && trimmedLeagueName !== league.name;

  const handleSaveLeague = () => {
    const trimmedName = editedLeagueName.trim();
    if (!trimmedName) {
      Alert.alert(t('Validation'), t('League name cannot be empty.'));
      return;
    }

    updateLeague.mutate(
      { leagueId: league?.id, name: trimmedName },
      {
        onError: (error) => {
          Alert.alert(t('Error'), error.message);
        },
      }
    );
  };

  if (isLoading || !league) return <LoadingOverlay />;
  if (error) return <Error error={error} />;

  return (
    <Screen>
      <BackButton title={t('Edit League')} />
      <KeyboardAwareScrollView bottomOffset={62} className="flex-1">
        <View className="p-4">
          <View className="bg-surface rounded-2xl border border-border p-4 mb-4">
            <View className="flex-row items-center gap-3 mb-4">
              <LogoBadge source={{ uri: league?.competition?.logo || '' }} width={40} height={40} />
              <View className="flex-1">
                <CText className="text-text text-lg font-bold">{league?.competition?.name}</CText>
                <CText className="text-muted text-sm">{league?.competition?.area}</CText>
              </View>
            </View>

            <View>
              <TextInput
                value={editedLeagueName}
                onChangeText={setEditedLeagueName}
                placeholder={t('Enter league name')}
                className="text-text px-3 py-3 bg-background border border-border rounded-lg"
                keyboardType="default"
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="off"
              />
            </View>
          </View>
        </View>
        <View className="px-2">
          {sortedMembers.map((member) => (
            <View key={member.id} className="my-1">
              <MemberCard
                key={member.id}
                member={member}
                isOwner={member.user_id === league?.owner_id}
                handleRemoveMember={() => handleRemoveMember(member.id, member.nickname ?? '')}
              />
            </View>
          ))}
        </View>
        <View className="flex-row gap-3 mt-6 px-4">
          <Button
            title={t('Save')}
            onPress={handleSaveLeague}
            loading={updateLeague.isPending}
            disabled={!canSaveLeagueName || updateLeague.isPending}
            className="flex-1 "
          />
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}
