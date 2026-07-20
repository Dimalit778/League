import { Error, LoadingOverlay } from '@/components/layout';
import {
  useDeleteLeague,
  useGetLeagueAndMembers,
  useLeaveLeague,
  useUpdateLeague,
} from '@/features/leagues/hooks/useLeagues';
import { useRemoveMember } from '@/features/profile/hooks/useMembers';
import { selectLeagueId, selectMemberUserId, useMemberStore } from '@/store/MemberStore';

import { Screen } from '@/components/layout';
import { AvatarImage, BackButton, Button, Text } from '@/components/ui';
import { LogoBadge } from '@/components/ui/LogoBadge';
import { MemberType } from '@/features/members/types';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/providers/AlertProvider';
import { FontAwesome6 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Copy, LogOut, UserPlus } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Share, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
type MemberCardProps = {
  member: MemberType;
  isOwner: boolean;
  canRemove: boolean;
  handleRemoveMember: (memberId: string, nickname: string) => void;
};

const MemberCard = ({ member, isOwner, canRemove, handleRemoveMember }: MemberCardProps) => {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center justify-between py-3 px-2 bg-surface rounded-lg border border-border">
      <View className="flex-row items-center flex-1">
        <View className="mr-3 w-10 h-10 rounded-full overflow-hidden">
          <AvatarImage nickname={member.nickname} path={member.avatar_url ?? null} />
        </View>
        <View className="flex-1 items-start">
          <Text variant="body" bold>
            {member.nickname}
          </Text>
          {isOwner && (
            <Text variant="caption" className="text-muted">
              {t('League Owner')}
            </Text>
          )}
        </View>
      </View>
      {canRemove && (
        <Pressable onPress={() => handleRemoveMember(member.id, member.nickname)} className="bg-error rounded-lg p-2">
          <FontAwesome6 name="trash" size={16} color="white" />
        </Pressable>
      )}
    </View>
  );
};
export default function EditLeagueScreen() {
  const memberUserId = useMemberStore(selectMemberUserId);
  const leagueId = useMemberStore(selectLeagueId);
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const { data: league, isLoading, error } = useGetLeagueAndMembers(leagueId!);

  const { showAlert } = useAlert();
  const removeMember = useRemoveMember();
  const updateLeague = useUpdateLeague();
  const deleteLeague = useDeleteLeague();
  const leaveLeague = useLeaveLeague();
  const isOwner = memberUserId === league?.owner_id;

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
    if (!leagueId || memberUserId !== league?.owner_id) return;
    showAlert({
      title: t('Remove Member'),
      message: `${t('Remove')} ${nickname} ${t('from this league')}?`,
      type: 'warning',
      buttons: [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Remove'), style: 'destructive', onPress: () => removeMember.mutate(memberId) },
      ],
    });
  };
  const trimmedLeagueName = editedLeagueName.trim();
  const canSaveLeagueName = league && trimmedLeagueName.length > 0 && trimmedLeagueName !== league.name;

  const handleCopyJoinCode = async () => {
    if (typeof league?.join_code === 'string') {
      await Clipboard.setStringAsync(league.join_code);
      Alert.alert(t('Copied!'), t('Join code copied to clipboard.'));
    }
  };

  const handleInviteFriends = async () => {
    if (!league) return;
    try {
      await Share.share({
        message: t('Join my {{area}} league "{{name}}"!\n\nUse code: {{join_code}}\n\nDownload the app to join!', {
          area: league.competition?.area || 'Football',
          name: league.name,
          join_code: league.join_code,
        }),
        title: t('Join {{name}} League', { name: league.name }),
      });
    } catch {
      showAlert({
        title: t('Error'),
        message: t('Failed to share invite code'),
        type: 'error',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  const confirmLeaveLeague = () => {
    if (!leagueId) return;
    showAlert({
      title: t('Leave League'),
      message: t('Are you sure you want to leave this league?'),
      type: 'warning',
      buttons: [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Leave'), style: 'destructive', onPress: () => leaveLeague.mutate(leagueId) },
      ],
    });
  };

  const confirmDeleteLeague = () => {
    if (!leagueId || !league) return;
    showAlert({
      title: t('Delete League'),
      message: t('Are you sure you want to delete this league?'),
      type: 'warning',
      buttons: [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Delete'),
          style: 'destructive',
          onPress: () => deleteLeague.mutate({ leagueId, ownerId: league.owner_id }),
        },
      ],
    });
  };

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
      },
    );
  };

  if (isLoading || !league) return <LoadingOverlay />;
  if (error) return <Error error={error} />;

  return (
    <Screen edges={['top']}>
      <BackButton title={t('Manage League')} />
      <KeyboardAwareScrollView bottomOffset={62} className="flex-1">
        <View className="p-4">
          <View className="bg-surface rounded-2xl border border-border p-4 mb-4">
            <View className="flex-row items-center gap-3 mb-4">
              <LogoBadge source={{ uri: league?.competition?.logo || '' }} width={40} height={40} />
              <View className="flex-1">
                <Text variant="body" bold>
                  {league?.competition?.name}
                </Text>
                <Text variant="caption" className="text-muted">
                  {league?.competition?.area}
                </Text>
              </View>
            </View>

            {isOwner ? (
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
            ) : (
              <Text variant="body" bold className="px-3 py-3">
                {league?.name}
              </Text>
            )}

            <Pressable
              onPress={handleCopyJoinCode}
              className="flex-row items-center justify-between mt-3 active:opacity-70"
            >
              <Text className="text-muted">{t('Invite code')}</Text>
              <View className="flex-row items-center gap-2">
                <Text semibold className="tracking-widest text-primary">
                  {league?.join_code}
                </Text>
                <Copy size={14} color={colors.primary} />
              </View>
            </Pressable>

            <Pressable
              onPress={handleInviteFriends}
              className="flex-row items-center gap-2 mt-3 active:opacity-70"
            >
              <UserPlus size={18} color={colors.primary} />
              <Text semibold className="text-primary">
                {t('Invite friends')}
              </Text>
            </Pressable>
          </View>
        </View>
        <View className="px-2">
          {sortedMembers.map((member) => {
            const memberIsOwner = member.user_id === league?.owner_id;
            return (
              <View key={member.id} className="my-1">
                <MemberCard
                  key={member.id}
                  member={member}
                  isOwner={memberIsOwner}
                  canRemove={isOwner && !memberIsOwner}
                  handleRemoveMember={() => handleRemoveMember(member.id, member.nickname ?? '')}
                />
              </View>
            );
          })}
        </View>
        {isOwner && (
          <View className="flex-row gap-3 mt-6 px-4">
            <Button
              title={t('Save')}
              onPress={handleSaveLeague}
              loading={updateLeague.isPending}
              disabled={!canSaveLeagueName || updateLeague.isPending}
              className="flex-1 "
            />
          </View>
        )}
        {isOwner ? (
          <View className="px-4 mt-4 mb-6">
            <Button
              title={t('Delete League')}
              variant="error"
              onPress={confirmDeleteLeague}
              disabled={deleteLeague.isPending}
              loading={deleteLeague.isPending}
            />
          </View>
        ) : (
          <View className="px-4 mt-4 mb-6">
            <Pressable
              onPress={confirmLeaveLeague}
              disabled={leaveLeague.isPending}
              accessibilityRole="button"
              accessibilityLabel={t('Leave league')}
              className="flex-row items-center justify-center gap-2.5 rounded-xl border border-error px-5 py-3 active:opacity-80 disabled:opacity-50"
            >
              <LogOut size={18} color={colors.error} strokeWidth={2.5} />
              <Text semibold className="text-error">
                {t('Leave league')}
              </Text>
            </Pressable>
          </View>
        )}
      </KeyboardAwareScrollView>
    </Screen>
  );
}
