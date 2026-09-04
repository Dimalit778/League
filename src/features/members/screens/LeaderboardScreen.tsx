import { TrophyIcon } from '@/assets/icons';
import { Error, Row, Screen, ScreenHeader, TabButton, Text } from '@/components';
import { useFloatBottomTabsInset } from '@/components/layout/FloatBottomTabs';
import {
  useGetCompetitionLeaderboard,
  useGetLeaderboard,
  useGetLeagueAndMembers,
} from '@/features/leagues/hooks/useLeagues';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { useAlert } from '@/providers/AlertProvider';
import { useAuthStore } from '@/store/AuthStore';
import { useCompetitionId, useLeagueId } from '@/store/PrimaryLeagueStore';
import { getProfileImage } from '@/utils/getProfileImage';
import { Image as ExpoImage } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { Share, View } from 'react-native';
import { InviteFriendsLink } from '../components/leaderboard/InviteFriendsLink';
import {
  LeaderboardAudienceToggle,
  type LeaderboardAudience,
} from '../components/leaderboard/LeaderboardAudienceToggle';
import { LeaderboardList } from '../components/leaderboard/LeaderboardList';
import LeaderboardSkeleton, { LeaderboardBodySkeleton } from '../components/leaderboard/LeaderboardSkeleton';
import { Podium } from '../components/leaderboard/Podium';
import { SparseLeaderboardCard } from '../components/leaderboard/SparseLeaderboardCard';

const Header = ({
  audience,
  setAudience,
}: {
  audience: LeaderboardAudience;
  setAudience: (audience: LeaderboardAudience) => void;
}) => {
  const { t } = useTranslation();
  return (
    <ScreenHeader
      center={<LeaderboardAudienceToggle value={audience} onChange={setAudience} />}
      right={
        <TabButton href="/(app)/(user)/leagues/my-leagues" icon={TrophyIcon} accessibilityLabel={t('My Leagues')} />
      }
    />
  );
};

export default function LeaderboardScreen() {
  const leagueId = useLeagueId();
  const competitionId = useCompetitionId();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const bottomTabsInset = useFloatBottomTabsInset();

  const [audience, setAudience] = useState<LeaderboardAudience>('friends');

  const friendsQuery = useGetLeaderboard(leagueId);
  const worldQuery = useGetCompetitionLeaderboard(competitionId, audience === 'world');

  const activeQuery = audience === 'world' ? worldQuery : friendsQuery;
  const { data: leaderboard, isLoading: activeIsLoading, error } = activeQuery;

  const { data: league } = useGetLeagueAndMembers(leagueId);
  const { t } = useTranslation();
  const { showAlert } = useAlert();

  const topThree = useMemo(() => leaderboard?.slice(0, 3) ?? [], [leaderboard]);
  const rest = leaderboard?.slice(3) ?? [];

  const avatarPaths = useMemo(
    () => [...new Set((leaderboard ?? []).map((m) => m.avatar_url).filter((path): path is string => !!path))],
    [leaderboard],
  );

  useEffect(() => {
    if (avatarPaths.length === 0) return;
    const urls = avatarPaths.map((path) => getProfileImage(path)).filter((url): url is string => !!url);
    ExpoImage.prefetch(urls, { cachePolicy: 'memory-disk' }).catch(() => false);
  }, [avatarPaths]);

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
        buttons: [{ text: t('OK') }],
      });
    }
  };

  if (friendsQuery.error) return <Error error={friendsQuery.error} />;
  if (!friendsQuery.data && friendsQuery.isLoading) return <LeaderboardSkeleton />;

  const isClickable = audience === 'friends';
  const bodyIsLoading = activeIsLoading || !leaderboard;

  return (
    <View className="flex-1 bg-background">
      <Header audience={audience} setAudience={setAudience} />
      <Screen scroll contentContainerStyle={{ flexGrow: 1, paddingBottom: bottomTabsInset }}>
        {error ? (
          <Error error={error} />
        ) : bodyIsLoading ? (
          <LeaderboardBodySkeleton />
        ) : rest.length === 0 ? (
          // Nobody past the podium yet — inviting is the primary action, so it
          // gets the prominent card centred in the space below the podium.
          <View className="flex-1">
            <Podium first={topThree[0]} second={topThree[1]} third={topThree[2]} clickable={isClickable} />
            <SparseLeaderboardCard
              memberCount={leaderboard?.length ?? 0}
              onInvite={handleInviteFriends}
              inviteDisabled={!league}
            />
          </View>
        ) : (
          <View className="flex-1">
            <Podium first={topThree[0]} second={topThree[1]} third={topThree[2]} clickable={isClickable} />

            <View className={cn('px-4 pt-3', spacing.list)}>
              <Row keepLtr className={spacing.list}>
                <View className="h-px flex-1 bg-border" />
                <Text variant="label" tone="muted" className="font-semibold uppercase tracking-wide">
                  {t('Full ranking')}
                </Text>
                <View className="h-px flex-1 bg-border" />
              </Row>
              <LeaderboardList leaderboard={rest} currentUserId={currentUserId} clickable={isClickable} />
            </View>

            {/* Populated board — the podium is the hero, so the invite drops to a
                quiet link pinned below the ranking. */}
            <View className="min-h-[24px] flex-1" />
            <InviteFriendsLink onInvite={handleInviteFriends} disabled={!league} />
          </View>
        )}
      </Screen>
    </View>
  );
}
