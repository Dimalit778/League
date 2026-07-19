import { Error, useFloatBottomTabsInset } from '@/components/layout';
import LeagueSkeleton from '@/features/leagues/components/LeagueSkeleton';
import { useGetLeaderboard } from '@/features/leagues/hooks/useLeagues';
import { usePrimaryMember } from '@/store/MemberStore';
import { getProfileImage } from '@/utils/getProfileImage';
import { Image as ExpoImage } from 'expo-image';
import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LeaderboardRow } from '../components/leaderboard/LeaderboardRow';
import { Podium } from '../components/leaderboard/Pudiom';

export default function LeaderboardScreen() {
  const { leagueId } = usePrimaryMember();
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
      <View className="mx-2 bg-surface border border-border rounded-md">
        {rest.map((member, index) => (
          <LeaderboardRow key={member.member_id} member={member} position={index + 4} />
        ))}
      </View>
    </ScrollView>
  );
}
