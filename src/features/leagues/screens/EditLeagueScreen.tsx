import {
  AvatarImage,
  BackButton,
  Badge,
  Button,
  Error,
  InputField,
  ListItem,
  LogoBadge,
  Screen,
  Text,
} from '@/components';
import {
  useDeleteLeague,
  useGetLeagueAndMembers,
  useLeaveLeague,
  useUpdateLeague,
} from '@/features/leagues/hooks/useLeagues';
import { useRemoveMember } from '@/features/members/hooks/useMembers';
import { useAuthStore } from '@/store/AuthStore';
import { useLeagueId } from '@/store/PrimaryLeagueStore';

import { MemberType } from '@/features/members/types/member.type';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/providers/AlertProvider';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { Copy, Flag, LogOut, Trash2, UserPlus } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Share, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { EditLeagueSkeleton } from '../components/EditLeagueSkeleton';
type MemberCardProps = {
  member: MemberType;
  isOwner: boolean;
  canRemove: boolean;
  handleRemoveMember: (memberId: string, nickname: string) => void;
};

const MemberCard = ({ member, isOwner, canRemove, handleRemoveMember }: MemberCardProps) => {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  return (
    <ListItem
      title={member.nickname}
      leading={
        <View className="h-10 w-10 overflow-hidden rounded-full">
          <AvatarImage nickname={member.nickname} path={member.avatar_url ?? null} />
        </View>
      }
      badge={isOwner ? <Badge label={t('League Owner')} variant="primary" /> : undefined}
      trailing={
        canRemove ? (
          <Button
            size="icon"
            variant="outline"
            accessibilityLabel={`${t('Remove')} ${member.nickname}`}
            haptic={false}
            onPress={() => handleRemoveMember(member.id, member.nickname)}
          >
            <Trash2 size={17} color={colors.error} />
          </Button>
        ) : undefined
      }
    />
  );
};
export default function EditLeagueScreen() {
  const userId = useAuthStore((s) => s.user?.id);
  const leagueId = useLeagueId();
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useThemeTokens();
  const { data: league, isLoading, error } = useGetLeagueAndMembers(leagueId);

  const { showAlert } = useAlert();
  const removeMember = useRemoveMember();
  const updateLeague = useUpdateLeague();
  const deleteLeague = useDeleteLeague();
  const leaveLeague = useLeaveLeague();
  const isOwner = !!userId && userId === league?.owner_id;

  const sortedMembers = useMemo(() => {
    return (league?.league_members ?? [])
      .filter((member) => member.active && member.user_id)
      .sort((a, b) => {
        const aIsOwner = a.user_id === league?.owner_id;
        const bIsOwner = b.user_id === league?.owner_id;
        if (aIsOwner && !bIsOwner) return -1;
        if (!aIsOwner && bIsOwner) return 1;
        return 0;
      });
  }, [league?.league_members, league?.owner_id]);

  const { control, watch, reset } = useForm<{ leagueName: string }>({
    defaultValues: { leagueName: '' },
  });
  const editedLeagueName = watch('leagueName') ?? league?.name ?? '';

  useEffect(() => {
    if (league?.name) {
      reset({ leagueName: league.name });
    }
  }, [league?.name, reset]);

  const handleRemoveMember = async (memberId: string, nickname: string) => {
    if (!leagueId || !isOwner) return;
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
  const canSaveLeagueName =
    league && trimmedLeagueName.length >= 2 && trimmedLeagueName.length <= 20 && trimmedLeagueName !== league.name;

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
        type: 'warning',
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
    if (!leagueId || !league?.owner_id) return;
    const ownerId = league.owner_id;
    showAlert({
      title: t('Delete League'),
      message: t('Are you sure you want to delete this league?'),
      type: 'warning',
      buttons: [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Delete'),
          style: 'destructive',
          onPress: () => deleteLeague.mutate({ leagueId, ownerId }),
        },
      ],
    });
  };

  const handleSaveLeague = () => {
    const trimmedName = editedLeagueName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 20) {
      Alert.alert(t('Validation'), t('League name must be between 2 and 20 characters.'));
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
  if (isLoading || !league) {
    return <EditLeagueSkeleton title={t('Manage League')} />;
  }
  if (error) {
    return <Error error={error} />;
  }
  return (
    <Screen padding="horizontal" bottomInset>
      <BackButton title={t('Manage League')} />
      <KeyboardAwareScrollView
        bottomOffset={canSaveLeagueName ? 110 : 62}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-5 pt-4">
          <View className="rounded-2xl border border-border bg-surface p-4">
            <View className="mb-4 flex-row items-center gap-3">
              <LogoBadge source={{ uri: league?.competition?.logo || '' }} width={40} height={40} />
              <View className="flex-1">
                <Text className="text-base font-bold">{league?.competition?.name}</Text>
                <Text tone="muted" variant="bodySmall">
                  {league?.competition?.area}
                </Text>
              </View>
            </View>

            {isOwner ? (
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text variant="bodySmall" tone="muted">
                    {t('League name')}
                  </Text>
                  <Text variant="caption" tone={editedLeagueName.length >= 20 ? 'warning' : 'muted'}>
                    {editedLeagueName.length}/20
                  </Text>
                </View>
                <InputField
                  control={control}
                  name="leagueName"
                  placeholder={t('Enter league name')}
                  maxLength={20}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="off"
                />
                {trimmedLeagueName.length > 0 && trimmedLeagueName.length < 2 ? (
                  <Text variant="caption" tone="error" className="text-center">
                    {t('League name must be between 2 and 20 characters.')}
                  </Text>
                ) : null}
              </View>
            ) : (
              <View>
                <Text variant="bodySmall" tone="muted">
                  {t('League name')}
                </Text>
                <Text className="mt-1 text-base font-semibold">{league?.name}</Text>
              </View>
            )}

            <View className="mt-4 overflow-hidden rounded-xl bg-subtle px-3">
              <ListItem
                title={t('Invite code')}
                description={league?.join_code}
                onPress={handleCopyJoinCode}
                trailing={<Copy size={18} color={colors.primary} />}
              />
            </View>

            <Button
              label={t('Invite friends')}
              variant="outline"
              fullWidth
              className="mt-3"
              leftIcon={<UserPlus size={18} color={colors.primary} />}
              onPress={handleInviteFriends}
            />
            {!isOwner ? (
              <Button
                label={t('Report league name')}
                variant="outline"
                fullWidth
                className="mt-3"
                leftIcon={<Flag size={18} color={colors.error} />}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/(league)/report-content',
                    params: { contentType: 'league_name', leagueId: league.id },
                  })
                }
              />
            ) : null}
          </View>

          <View>
            <View className="mb-2 flex-row items-center justify-between px-1">
              <Text variant="subtitle">{t('League Members')}</Text>
              <Badge label={`${sortedMembers.length}/${league.max_members}`} />
            </View>
            <View className="overflow-hidden rounded-2xl border border-border bg-surface px-3">
              {sortedMembers.map((member, index) => {
                const memberIsOwner = member.user_id === league?.owner_id;
                return (
                  <View key={member.id} className={index < sortedMembers.length - 1 ? 'border-b border-border' : ''}>
                    <MemberCard
                      member={member}
                      isOwner={memberIsOwner}
                      canRemove={isOwner && !memberIsOwner}
                      handleRemoveMember={handleRemoveMember}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View className="mt-auto pt-8 pb-4">
          <View className="rounded-2xl items-center border border-error/40 bg-surface p-4">
            <Text variant="subtitle" tone="error">
              {t('Danger zone')}
            </Text>
            <Text variant="bodySmall" tone="muted" className="mb-4 mt-1">
              {isOwner ? t('Deleting a league cannot be undone.') : t('You will lose access to this league.')}
            </Text>
            <Button
              label={isOwner ? t('Delete League') : t('Leave league')}
              variant="outline"
              fullWidth
              onPress={isOwner ? confirmDeleteLeague : confirmLeaveLeague}
              disabled={isOwner ? deleteLeague.isPending : leaveLeague.isPending}
              loading={isOwner ? deleteLeague.isPending : leaveLeague.isPending}
              leftIcon={isOwner ? <Trash2 size={18} color={colors.error} /> : <LogOut size={18} color={colors.error} />}
              className="border-error"
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
      {isOwner && canSaveLeagueName && (
        <View className="border-t border-border bg-surface px-4 py-3">
          <Button
            label={t('Save changes')}
            onPress={handleSaveLeague}
            loading={updateLeague.isPending}
            disabled={updateLeague.isPending}
            fullWidth
          />
        </View>
      )}
    </Screen>
  );
}
