import { Screen, useFloatBottomTabsInset } from '@/components/layout';
import { useLeagueOverview } from '@/features/league-overview/hooks/useLeagueOverview';
import { LeagueHeroCard } from '@/features/leagues/components/leagueOverview/LeagueHeroCard';
import { getProfileImage } from '@/utils/getProfileImage';
import { Image as ExpoImage } from 'expo-image';
import { useEffect, useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import { QuickAccessSection } from '@/features/leagues/components/leagueOverview/QuickAccessSection';
import { TopLeaderboardCard } from '@/features/leagues/components/leagueOverview/TopLeaderboardCard';
import { UpcomingMatchesCard } from '@/features/leagues/components/leagueOverview/UpcomingMatches';

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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomTabsInset + 24 }}>
        <View>
          <LeagueHeroCard league={league} memberStats={memberStats} />

          <QuickAccessSection />

          <TopLeaderboardCard
            users={leaderboard.slice(0, TOP_LEADERBOARD_SIZE)}
            currentMemberId={memberStats.memberId}
          />

          <UpcomingMatchesCard matches={todayMatches} />
        </View>
      </ScrollView>
    </Screen>
  );
}
