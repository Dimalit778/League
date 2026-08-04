import { Error, Screen, useFloatBottomTabsInset } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { useGetLeagueAndMembers, useLeaveLeague } from '@/features/leagues/hooks/useLeagues';
import { LeagueDetailsSection } from '@/features/members/components/profile/LeagueDetailsSection';
import { ProfileHeroCard } from '@/features/members/components/profile/ProfileHeroCard';
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
  const memberId = useMemberId();
  const leagueId = useLeagueId();
  const userId = useAuthStore((s) => s.user?.id);
  const bottomInset = useFloatBottomTabsInset();
  const leaveLeague = useLeaveLeague();
  const { data: member, isLoading: memberLoading } = useGetMember(memberId);
  const { data: stats, isLoading, error } = useMemberStats(memberId);
  const { data: league, isLoading: leagueLoading } = useGetLeagueAndMembers(leagueId);

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

  if (error) return <Error error={error} />;
  if (isLoading || memberLoading || leagueLoading || !stats || !member || !league) return <ProfileSkeleton />;

  return (
    <Screen scroll padding="horizontal" bottomInset={bottomInset}>
      <View className={cn(spacing.section)}>
        <ProfileHeroCard />
        <ProfileNicknameEdit initialNickname={member.nickname} />

        <LeagueDetailsSection league={league} memberUserId={userId ?? ''} />

        <Achievements stats={stats} />

        <View className="mt-4 rounded-2xl items-center  bg-surface p-4 gap-4">
          <Button
            label={t('Leave league')}
            variant="outline"
            fullWidth
            onPress={confirmLeaveLeague}
            disabled={leaveLeague.isPending}
            loading={leaveLeague.isPending}
            leftIcon={<LogOut size={18} color={colors.error} />}
            className="border-error"
          />

          <Text variant="bodySmall" tone="muted" className=" text-center">
            {t('You will lose access to this league.')}
          </Text>
        </View>
      </View>
    </Screen>
  );
};

export default ProfileScreen;
