import { useMemberStore } from '@/store/MemberStore';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import FixturesList from './components/fixtures/fixtures-list';
import MatchdaysListSkeleton from './components/fixtures/SkeletonFixtures';
import MatchList from './components/matches/Matches-list';
import MatchesSkeleton from './components/matches/SkeletonMatches';

const MatchesScreen = () => {
  const { member } = useMemberStore();
  const userId = member?.user_id;
  const competition = member?.league?.competition;
  const currentFixture = competition?.current_fixture as number;
  const totalFixtures = competition?.total_fixtures as number;

  const [selectedFixture, setSelectedFixture] = useState<number | null>(null);
  const [animateScroll, setAnimateScroll] = useState(false);
  const fixtures = useMemo(
    () =>
      totalFixtures
        ? Array.from({ length: totalFixtures }, (_, i) => i + 1)
        : [],
    [totalFixtures]
  );

  useFocusEffect(
    useCallback(() => {
      if (currentFixture) {
        setAnimateScroll(false);
        setSelectedFixture(currentFixture);
      }
      return () => {
        setSelectedFixture(null);
      };
    }, [currentFixture])
  );

  const handleFixturePress = useCallback((fixture: number) => {
    setAnimateScroll(true);
    setSelectedFixture(fixture);
  }, []);

  if (!fixtures.length || selectedFixture == null) {
    return (
      <View className="flex-1 bg-background">
        <MatchdaysListSkeleton />
        <MatchesSkeleton />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FixturesList
        fixtures={fixtures ?? []}
        selectedFixture={selectedFixture ?? 1}
        handleFixturePress={handleFixturePress}
        animateScroll={animateScroll}
      />

      {selectedFixture && competition && userId && (
        <MatchList
          selectedFixture={selectedFixture}
          competitionId={competition.id}
          userId={userId}
        />
      )}
    </View>
  );
};

export default MatchesScreen;
