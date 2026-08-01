import { Error, Screen } from '@/components/layout';
import { AvatarImage, BackButton, Card, EmptyState, Text } from '@/components/ui';
import { useGetMember } from '@/features/members/hooks/useMembers';
import { useMemberStats } from '@/features/members/hooks/useMemberStats';
import { useTranslation } from '@/hooks/useTranslation';
import { spacing } from '@/lib/nativewind/spacing';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import MemberDetailsSkeleton from '../components/MemberDetailsSkeleton';
import MemberStats from '../components/memberStats';

export default function MemberDetailsScreen() {
  const { memberId = '' } = useLocalSearchParams<{ memberId: string }>();
  const { t } = useTranslation();
  const memberQuery = useGetMember(memberId);
  const statsQuery = useMemberStats(memberId);

  if (!memberId) {
    return (
      <Screen padding="horizontal" edges={['top', 'bottom']}>
        <BackButton />
        <EmptyState variant="error" title={t('Member not found')} />
      </Screen>
    );
  }

  if (memberQuery.isLoading || statsQuery.isLoading) {
    return <MemberDetailsSkeleton />;
  }

  if (memberQuery.error || statsQuery.error) {
    return <Error error={(memberQuery.error ?? statsQuery.error) as Error} />;
  }

  const member = memberQuery.data;
  if (!member) {
    return (
      <Screen padding="horizontal" edges={['top', 'bottom']}>
        <BackButton />
        <EmptyState variant="empty" title={t('Member not found')} />
      </Screen>
    );
  }

  const stats = statsQuery.data;

  return (
    <Screen scroll padding="horizontal" edges={['top', 'bottom']} contentClassName={spacing.stack}>
      <BackButton />

      <Card variant="elevated" contentClassName="items-center">
        <View className="h-24 w-24 overflow-hidden rounded-full border-2 border-border p-0.5">
          <AvatarImage path={member.avatar_url} nickname={member.nickname} />
        </View>
        <View className="mt-3 items-center">
          <Text variant="titleLarge" className="text-center">
            {member.nickname}
          </Text>
          <Text variant="bodySmall" tone="muted" className="text-center">
            {member.league?.name ?? ''}
          </Text>
        </View>
        <View className="mt-4 flex-row items-center">
          <View className="flex-1 items-center">
            <Text variant="caption" tone="muted">
              {t('Rank')}
            </Text>
            <Text variant="title" tone="primary">
              {stats?.rank ? `#${stats.rank}` : '—'}
            </Text>
          </View>
          <View className="h-10 w-px bg-border" />
          <View className="flex-1 items-center">
            <Text variant="caption" tone="muted">
              {t('Points')}
            </Text>
            <Text variant="title" tone="primary">
              {stats?.totalPoints ?? 0}
            </Text>
          </View>
        </View>
      </Card>

      <MemberStats stats={stats} />
    </Screen>
  );
}
