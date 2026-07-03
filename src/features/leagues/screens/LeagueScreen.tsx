import { Error, Screen, useFloatBottomTabsInset } from '@/components/layout';
import { LeaderboardStatsBar } from '@/features/leagues/components/leaderboard/LeaderboardStatsBar';
import { LeaderboardTableHeader } from '@/features/leagues/components/leaderboard/LeaderboardTableHeader';
import LeagueSkeleton from '@/features/leagues/components/LeagueSkeleton';
import { useGetLeaderboard } from '@/features/leagues/hooks/useLeagues';
import { selectCompetition, selectLeagueId, selectMemberId, useMemberStore } from '@/store/MemberStore';
import { getProfileImage } from '@/utils/getProfileImage';
import { Image as ExpoImage } from 'expo-image';
import { useEffect, useMemo } from 'react';
import { FlatList, View } from 'react-native';
import LeaderboardCard from '../components/LeaderboardCard';
import TopThree from '../components/TopThree';

const LeagueScreen = () => {
  const leagueId = useMemberStore(selectLeagueId) ?? '';
  const memberId = useMemberStore(selectMemberId) ?? '';
  const activeMember = useMemberStore((s) => s.activeMember);
  const competition = useMemberStore(selectCompetition);
  const bottomTabsInset = useFloatBottomTabsInset();

  const { data: leaderboard, isLoading, error } = useGetLeaderboard(leagueId);

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
  }, [avatarUrls, avatarUrlsKey, leaderboard, leagueId]);

  const topThree = leaderboard?.slice(0, 3) ?? [];
  const yourRank = useMemo(() => {
    if (!leaderboard || !memberId) return null;
    const index = leaderboard.findIndex((entry) => entry.member_id === memberId);
    return index !== -1 ? index + 1 : null;
  }, [leaderboard, memberId]);

  const leagueName = activeMember?.league?.name ?? activeMember?.league?.competition?.name ?? 'League';
  const gameweek = competition?.current_fixture ?? 1;

  if (error) return <Error error={error} />;
  if (!leaderboard || isLoading) return <LeagueSkeleton />;

  return (
    <Screen>
      <FlatList
        data={leaderboard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomTabsInset + 16 }}
        keyExtractor={(item, index) => item.member_id ?? `member-${index}`}
        ListHeaderComponent={
          <View>
            <LeaderboardStatsBar membersCount={leaderboard.length} gameweek={gameweek} yourRank={yourRank} />
            <TopThree topMembers={topThree} />
            <LeaderboardTableHeader />
          </View>
        }
        renderItem={({ item, index }) => (
          <LeaderboardCard item={item} index={index} isCurrentUser={item.member_id === memberId} />
        )}
        getItemLayout={(_, index) => ({
          length: 52,
          offset: 52 * index,
          index,
        })}
      />
    </Screen>
  );
};

export default LeagueScreen;
