import { Error, Screen, useFloatBottomTabsInset } from '@/components/layout';
import LeagueSkeleton from '@/features/leagues/components/LeagueSkeleton';
import { getProfileImage } from '@/utils/getProfileImage';
import { Image as ExpoImage } from 'expo-image';
import { useEffect, useMemo } from 'react';
import { FlatList, View } from 'react-native';
import LeaderboardCard from '../../members/components/rank/LeaderboardCard';
import TopThree from '../../members/components/rank/TopThree';
import { useLeagueOverview } from '@/features/leagues/hooks/useLeagueOverview';
import { LeagueOverviewHeader } from '../components/leagueOverview/LeagueOverviewHeader';

export default function OverviewScreen() {
  const { league, memberStats, leaderboard, todayMatches } = useLeagueOverview();
  const bottomTabsInset = useFloatBottomTabsInset();

  const avatarUrls = useMemo(() => {
    if (!leaderboard) return [];

    const urls = leaderboard.map((member) => getProfileImage(member.avatar_url)).filter((url): url is string => !!url);

    return [...new Set(urls)];
  }, [leaderboard]);

  const avatarUrlsKey = avatarUrls.join('|');

  useEffect(() => {
    if (!leaderboard || avatarUrls.length === 0) {
      return;
    }

    ExpoImage.prefetch(avatarUrls, { cachePolicy: 'memory-disk' }).catch(() => false);
  }, [avatarUrls, avatarUrlsKey, leaderboard, league.id]);

  const topThree = leaderboard?.slice(0, 3) ?? [];

<Screen>
      <LeagueOverviewHeader
        title={league.name}
        subtitle="League overview"
        trophyUrl={league.logoUrl}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-4 gap-5">
          <LeagueHeroCard 
            league={league}
            memberStats={memberStats}
          />

  
          <QuickAccessSection />

          <TopLeaderboardCard
            users={leaderboard}
            currentMemberId={memberStats.memberId}
          />

          <UpcomingMatchesCard matches={upcomingMatches} />
        </View>
      </ScrollView>
    </Screen>
  );
}