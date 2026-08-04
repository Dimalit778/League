import { Error, Screen, useFloatBottomTabsInset } from '@/components/layout';
import { useGetLeaderboard, useGetLeagueAndMembers } from '@/features/leagues/hooks/useLeagues';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/providers/AlertProvider';
import { useLeagueId } from '@/store/PrimaryLeagueStore';
import { getProfileImage } from '@/utils/getProfileImage';
import { Image as ExpoImage } from 'expo-image';
import { useEffect, useMemo } from 'react';
import { Share } from 'react-native';
import { LeaderboardList } from '../components/leaderboard/LeaderboardList';
import LeaderboardSkeleton from '../components/leaderboard/LeaderboardSkeleton';
import { Podium } from '../components/leaderboard/Pudiom';
import { SparseLeaderboardCard } from '../components/leaderboard/SparseLeaderboardCard';

export default function LeaderboardScreen() {
  const leagueId = useLeagueId();
  const bottomTabsInset = useFloatBottomTabsInset();
  const { data: leaderboard, isLoading, error } = useGetLeaderboard(leagueId);
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
        buttons: [{ text: 'OK' }],
      });
    }
  };

  if (error) return <Error error={error} />;
  if (!leaderboard || isLoading) return <LeaderboardSkeleton />;

  return (
    <Screen scroll padding="horizontal" bottomInset={bottomTabsInset}>
      <Podium first={topThree[0]} second={topThree[1]} third={topThree[2]} />

      {rest.length > 0 ? (
        <LeaderboardList leaderboard={rest} />
      ) : (
        <SparseLeaderboardCard
          memberCount={leaderboard.length}
          onInvite={handleInviteFriends}
          inviteDisabled={!league}
        />
      )}
    </Screen>
  );
}
