import { Error, useFloatBottomTabsInset } from '@/components/layout';
import LeagueSkeleton from '@/features/leagues/components/overview/LeagueSkeleton';
import { useGetLeaderboard } from '@/features/leagues/hooks/useLeagues';
import { useLeagueId } from '@/store/PrimaryLeagueStore';
import { getProfileImage } from '@/utils/getProfileImage';
import { Image as ExpoImage } from 'expo-image';
import { useEffect, useMemo } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { LeaderboardList } from '../components/leaderboard/LeaderboardList';
import { Podium } from '../components/leaderboard/Pudiom';

export default function LeaderboardScreen() {
  const leagueId = useLeagueId();

  const bottomTabsInset = useFloatBottomTabsInset();

  const { data: leaderboard, isLoading, error } = useGetLeaderboard(leagueId);

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

  if (error) return <Error error={error} />;
  if (!leaderboard || isLoading) return <LeagueSkeleton />;

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: bottomTabsInset + 16 }}>
      <Podium first={topThree[0]} second={topThree[1]} third={topThree[2]} />

      <LeaderboardList leaderboard={rest} />
    </ScrollView>
  );
}
