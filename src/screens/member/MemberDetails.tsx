import { Error, LoadingOverlay } from '@/components/layout';
import FixturesList from '@/components/shared/fixtures-list';
import { AvatarImage, BackButton, Card } from '@/components/ui';
import { useMemberStatsById } from '@/hooks/useMembers';
import { useStoreData } from '@/store/store';

import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MatchList } from './components';
import MemberStats from './components/stats';

const MemberDetailsScreen = () => {
  const { memberId, position, nickname, avatarUrl } = useLocalSearchParams<{
    memberId: string;
    position: string;
    nickname: string;
    avatarUrl: string;
  }>();
  const { league } = useStoreData();

  const [selectedFixture, setSelectedFixture] = useState<number | null>(null);
  const [animateScroll, setAnimateScroll] = useState(false);

  const { data: stats, error: statsError, isLoading } = useMemberStatsById(memberId);

  const competition = league?.competition;
  const currentFixture = competition?.current_fixture as number;
  const memberPosition = position ? parseInt(position) : null;

  const fixtures = useMemo(
    () => (currentFixture ? Array.from({ length: currentFixture }, (_, i) => i + 1) : []),
    [currentFixture]
  );

  useEffect(() => {
    if (currentFixture && selectedFixture === null) {
      setSelectedFixture(currentFixture);
    }
  }, [currentFixture, selectedFixture]);

  const handleFixturePress = useCallback((fixture: number) => {
    setAnimateScroll(true);
    setSelectedFixture(fixture);
  }, []);

  if (statsError) return <Error error={statsError} />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton />
      {(isLoading || !stats) && <LoadingOverlay />}

      <Card className="mx-3 px-4 p-2">
        <View className="flex-row items-center gap-3">
          <View className="w-16 h-16 rounded-full overflow-hidden">
            <AvatarImage nickname={nickname} path={avatarUrl || null} />
          </View>

          <View className="flex-1">
            <Text className="text-text text-lg font-bold" numberOfLines={1}>
              {nickname}
            </Text>
          </View>
          <View className="flex-row items-center gap-4">
            <View className="items-end">
              <Text className="text-muted text-[10px] uppercase tracking-wide mb-0.5">Points</Text>
              <Text className="text-primary text-base font-semibold">{stats?.totalPoints.toLocaleString() ?? 0}</Text>
            </View>
            <View className="h-6 w-px bg-border" />
            <View className="items-end">
              <Text className="text-muted text-[10px] uppercase tracking-wide mb-0.5">Position</Text>
              <Text className="text-primary text-base font-semibold">{memberPosition ?? '—'}</Text>
            </View>
          </View>
        </View>
      </Card>

      {stats && <MemberStats stats={stats} />}
      <View className="mt-2">
        <FixturesList
          fixtures={fixtures}
          selectedFixture={selectedFixture ?? 1}
          handleFixturePress={handleFixturePress}
          animateScroll={animateScroll}
        />
      </View>
      {selectedFixture && competition && memberId && (
        <MatchList selectedFixture={selectedFixture} competitionId={competition.id} memberId={memberId} />
      )}
    </SafeAreaView>
  );
};

export default MemberDetailsScreen;
