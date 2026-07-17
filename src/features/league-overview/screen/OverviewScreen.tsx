import { Screen, useFloatBottomTabsInset } from '@/components/layout';
import { useLeagueOverview } from '@/features/league-overview/hooks/useLeagueOverview';
import { getProfileImage } from '@/utils/getProfileImage';
import { Image as ExpoImage } from 'expo-image';
import { useEffect, useMemo } from 'react';
import { ScrollView } from 'react-native';

import { TopLeaderboardCard } from '@/features/league-overview/components/TopLeaderboardCard';
import { UpcomingMatches } from '@/features/league-overview/components/Upcoming-matches';
import Header from '../components/Header';
const TOP_LEADERBOARD_SIZE = 5;

export default function OverviewScreen() {
  const { league, memberStats, leaderboard, todayMatches } = useLeagueOverview();
  const bottomTabsInset = useFloatBottomTabsInset();

  const avatarUrls = useMemo(() => {
    const urls = leaderboard.map((member) => getProfileImage(member.avatar_url)).filter((url): url is string => !!url);

    return [...new Set(urls)];
  }, [leaderboard]);

  useEffect(() => {
    if (avatarUrls.length === 0) return;

    ExpoImage.prefetch(avatarUrls, { cachePolicy: 'memory-disk' }).catch(() => false);
  }, [avatarUrls]);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomTabsInset + 24, gap: 12 }}
      >
        <Header
          leagueName={league.name}
          logoUrl={league.logoUrl}
          points={memberStats.points}
          nickname={memberStats.nickname}
        />

        <TopLeaderboardCard users={leaderboard.slice(0, TOP_LEADERBOARD_SIZE)} currentMemberId={memberStats.memberId} />

        <UpcomingMatches matches={todayMatches} />
      </ScrollView>
    </Screen>
  );
}
