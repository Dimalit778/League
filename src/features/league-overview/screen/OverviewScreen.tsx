import { useLeagueOverview } from '@/features/league-overview/hooks/useLeagueOverview';
import { getProfileImage } from '@/utils/getProfileImage';
import { Image as ExpoImage } from 'expo-image';
import { useEffect, useMemo } from 'react';

import { UpcomingMatches } from '@/features/league-overview/components/Upcoming-matches';
import { ScrollView } from 'react-native-gesture-handler';

const TOP_LEADERBOARD_SIZE = 5;

export default function OverviewScreen() {
  const { memberStats, leaderboard, todayMatches } = useLeagueOverview();

  const avatarUrls = useMemo(() => {
    const urls = leaderboard.map((member) => getProfileImage(member.avatar_url)).filter((url): url is string => !!url);

    return [...new Set(urls)];
  }, [leaderboard]);

  useEffect(() => {
    if (avatarUrls.length === 0) return;

    ExpoImage.prefetch(avatarUrls, { cachePolicy: 'memory-disk' }).catch(() => false);
  }, [avatarUrls]);

  return (
    <ScrollView className="flex-1">
      <UpcomingMatches matches={todayMatches} />
    </ScrollView>
  );
}
