import { AvatarImage, Button, Card, EmptyState, Error, Screen, Text } from '@/components';
import { useGetMember } from '@/features/members/hooks/useMembers';
import { useMemberStats } from '@/features/members/hooks/useMemberStats';
import { useBlockStatus, useBlockUser, useUnblockUser } from '@/features/moderation/hooks/useModeration';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { spacing } from '@/lib/nativewind/spacing';
import { useAuthStore } from '@/store/AuthStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Flag, ShieldBan, ShieldCheck } from 'lucide-react-native';
import { Alert, View } from 'react-native';
import MemberDetailsSkeleton from '../components/MemberDetailsSkeleton';
import MemberStats from '../components/MemberStats';

export default function MemberDetailsScreen() {
  const { memberId } = useLocalSearchParams<{ memberId: string }>();
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const router = useRouter();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const memberQuery = useGetMember(memberId);
  const statsQuery = useMemberStats(memberId);
  const targetUserId = memberQuery.data?.user_id;
  const blockStatus = useBlockStatus(targetUserId);
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();

  if (memberQuery.isLoading || statsQuery.isLoading) {
    return <MemberDetailsSkeleton />;
  }

  if (memberQuery.error || statsQuery.error) {
    return <Error error={(memberQuery.error ?? statsQuery.error) as Error} />;
  }

  const member = memberQuery.data;
  if (!member) {
    return (
      <Screen padding="all" bottomInset>
        <EmptyState size="md" title={t('Member not found')} />
      </Screen>
    );
  }

  const stats = statsQuery.data;
  const displayName = member.user_id ? member.nickname : t('Deleted Player');
  const canModerate = !!member.user_id && member.user_id !== currentUserId;
  const isBlocked = blockStatus.data === true;

  const handleReport = () => {
    router.push({
      pathname: '/(app)/(league)/report-content',
      params: { memberId: member.id, leagueId: member.league_id },
    });
  };

  const handleBlockToggle = () => {
    if (!member.user_id) return;

    if (isBlocked) {
      unblockUser.mutate(member.user_id, {
        onSuccess: () => Alert.alert(t('User unblocked'), t('You can see this user’s content again.')),
        onError: (error) => Alert.alert(t('Error'), error.message),
      });
      return;
    }

    Alert.alert(t('Block user'), t('Their profile, predictions and leaderboard entries will be hidden from you.'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Block'),
        style: 'destructive',
        onPress: () =>
          blockUser.mutate(member.user_id!, {
            onSuccess: () => {
              Alert.alert(t('User blocked'), t('This user’s content is now hidden.'));
              router.back();
            },
            onError: (error) => Alert.alert(t('Error'), error.message),
          }),
      },
    ]);
  };

  return (
    <Screen scroll padding="all" bottomInset contentClassName={spacing.stack}>
      <Card variant="surface" contentClassName="items-center px-5 py-6">
        <View className="h-24 w-24 overflow-hidden rounded-full border-[3px] border-primary bg-subtle p-0.5">
          <AvatarImage path={member.avatar_url} nickname={displayName} />
        </View>
        <View className="mt-3 items-center">
          <Text variant="heading" size="2xl" className="text-center">
            {displayName}
          </Text>
          <Text variant="body" size="sm" tone="muted" className="mt-1 text-center">
            {member.league?.name ?? ''}
          </Text>
        </View>
        <View className="mt-5 w-full flex-row items-center rounded-2xl bg-subtle py-3">
          <View className="flex-1 items-center">
            <Text variant="caption" tone="muted">
              {t('Rank')}
            </Text>
            <Text variant="heading" size="2xl" tone="primary" className="text-center">
              {stats?.rank ? `#${stats.rank}` : '—'}
            </Text>
          </View>
          <View className="h-11 w-px bg-border" />
          <View className="flex-1 items-center">
            <Text variant="caption" tone="muted">
              {t('Points')}
            </Text>
            <Text variant="heading" size="2xl" tone="primary" className="text-center">
              {stats?.totalPoints ?? 0}
            </Text>
          </View>
        </View>
      </Card>

      {canModerate && (
        <View className="flex-row gap-3">
          <Button
            label={t('Report')}
            intent="outline"
            className="flex-1"
            leftIcon={<Flag size={18} color={colors.text} />}
            onPress={handleReport}
          />
          <Button
            label={isBlocked ? t('Unblock') : t('Block')}
            intent={isBlocked ? 'outline' : 'destructive'}
            className="flex-1"
            leftIcon={
              isBlocked ? <ShieldCheck size={18} color={colors.text} /> : <ShieldBan size={18} color="#FFFFFF" />
            }
            onPress={handleBlockToggle}
            loading={blockUser.isPending || unblockUser.isPending}
          />
        </View>
      )}

      <MemberStats stats={stats} />
    </Screen>
  );
}
