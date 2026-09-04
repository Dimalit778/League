import { Button, Error, Screen, Text } from '@/components';
import { useFloatBottomTabsInset } from '@/components/layout/FloatBottomTabs';
import { useGetLeagueAndMembers, useLeaveLeague } from '@/features/leagues/hooks/useLeagues';
import { ProfileHeader } from '@/features/members/components/profile/Header';
import { LeagueDetailsSection } from '@/features/members/components/profile/LeagueDetailsSection';
import { ProfileImageCard } from '@/features/members/components/profile/ProfileImageCard';
import { ProfileNicknameEdit } from '@/features/members/components/profile/ProfileNicknameEdit';
import { ProfileSkeleton } from '@/features/members/components/ProfileSkeleton';
import { Achievements } from '@/features/members/components/stats/Achievement';
import { useGetMember } from '@/features/members/hooks/useMembers';
import { useMemberStats } from '@/features/members/hooks/useMemberStats';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { useAlert } from '@/providers/AlertProvider';
import { useAuthStore } from '@/store/AuthStore';
import { useLeagueId, useMemberId } from '@/store/PrimaryLeagueStore';
import { LogOut } from 'lucide-react-native';
import { View } from 'react-native';

const ProfileScreen = () => {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const { showAlert } = useAlert();
  const bottomTabsInset = useFloatBottomTabsInset();
  const memberId = useMemberId();
  const leagueId = useLeagueId();
  const userId = useAuthStore((s) => s.user?.id);
  const leaveLeague = useLeaveLeague();
  const { data: member, isLoading: memberLoading, error: memberError } = useGetMember(memberId);
  const { data: stats, isLoading, error } = useMemberStats(memberId);
  const { data: league, isLoading: leagueLoading, error: leagueError } = useGetLeagueAndMembers(leagueId);

  const confirmLeaveLeague = () => {
    if (!leagueId) return;
    showAlert({
      title: t('Leave League'),
      message: t('Are you sure you want to leave this league?'),
      type: 'warning',
      buttons: [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Leave'), onPress: () => leaveLeague.mutate(leagueId) },
      ],
    });
  };

  const loadError = error ?? memberError ?? leagueError;
  if (loadError) return <Error error={loadError} />;
  if (isLoading || memberLoading || leagueLoading) return <ProfileSkeleton />;
  if (!member || !league || !stats) {
    return <Error error={!member ? t('Member not found') : !league ? t('League not found') : t('Something went wrong')} />;
  }

  return (
    <View className="flex-1 bg-background">
      <ProfileHeader nickname={member.nickname} />
      <Screen scroll padding="all" className="flex-grow" contentContainerStyle={{ paddingBottom: bottomTabsInset }}>
        <View className={cn('mx-auto w-full max-w-[720px]', spacing.section)}>
          <ProfileImageCard />
          <ProfileNicknameEdit initialNickname={member.nickname} />

          <LeagueDetailsSection league={league} memberUserId={userId ?? ''} />

          <Achievements stats={stats} />

          <View className={cn('mt-4 items-center rounded-2xl bg-surface', spacing.card, spacing.stack)}>
            <Button
              label={t('Leave league')}
              intent="outline"
              fullWidth
              onPress={confirmLeaveLeague}
              disabled={leaveLeague.isPending}
              loading={leaveLeague.isPending}
              leftIcon={<LogOut size={18} color={colors.error} />}
              className="border-error"
            />

            <Text variant="body" size="sm" tone="muted" className=" text-center">
              {t('You will lose access to this league.')}
            </Text>
          </View>
        </View>
      </Screen>
    </View>
  );
};

export default ProfileScreen;
