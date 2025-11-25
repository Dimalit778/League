import { useGetCompetitionFixtures } from '@/features/leagues/hooks/useCompetition';
import SkeletonFixtures from '@/features/matches/components/FixturesSkeleton';
import FixturesList from '@/features/matches/components/matches/FixturesList';
import MatchesList from '@/features/matches/components/matches/MatchesList';
import SkeletonMatches from '@/features/matches/components/MatchesSkeleton';
import { useMemberStore } from '@/store/MemberStore';
import { useFocusEffect, usePathname } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

const MatchesScreen = () => {
  const competitionId = useMemberStore((s) => s.competitionId);

  const pathname = usePathname();

  const { data: fixturesData } = useGetCompetitionFixtures(competitionId ?? 0);

  const [selectedFixture, setSelectedFixture] = useState<number | null>(fixturesData?.currentFixture ?? 1);
  const [animateScroll, setAnimateScroll] = useState(false);
  const preservedFixtureRef = useRef<number | null>(null);
  const previousPathnameRef = useRef<string>(pathname);
  const isNavigatingToMatchRef = useRef(false);

  useEffect(() => {
    const isOnMatchDetail = pathname?.includes('/match/');
    const isOnMatchesPage = pathname?.includes('/Matches');
    const wasOnMatchDetail = previousPathnameRef.current?.includes('/match/');
    const wasOnMatchesPage = previousPathnameRef.current?.includes('/Matches');

    // If we're navigating away from matches to match detail, preserve the fixture
    if (isOnMatchDetail && wasOnMatchesPage && selectedFixture) {
      preservedFixtureRef.current = selectedFixture;
      isNavigatingToMatchRef.current = true;
    }

    // If we're coming back from match detail to matches, mark that we should restore
    if (isOnMatchesPage && wasOnMatchDetail && preservedFixtureRef.current) {
      isNavigatingToMatchRef.current = true;
    }

    // If we're coming to matches from other pages (not match detail), clear preserved fixture
    if (isOnMatchesPage && !wasOnMatchDetail && !wasOnMatchesPage) {
      preservedFixtureRef.current = null;
      isNavigatingToMatchRef.current = false;
    }

    previousPathnameRef.current = pathname;
  }, [pathname, selectedFixture]);

  useFocusEffect(
    useCallback(() => {
      // If we have a preserved fixture and we're coming back from match detail, restore it
      if (preservedFixtureRef.current && isNavigatingToMatchRef.current) {
        setAnimateScroll(false);
        setSelectedFixture(preservedFixtureRef.current);
        preservedFixtureRef.current = null;
        isNavigatingToMatchRef.current = false;
      } else if (fixturesData?.currentFixture && !preservedFixtureRef.current) {
        // Otherwise, reset to current fixture (coming from other pages)
        setAnimateScroll(false);
        setSelectedFixture(fixturesData?.currentFixture ?? 1);
      }
    }, [fixturesData?.currentFixture])
  );

  const handleFixturePress = useCallback((fixture: number) => {
    setAnimateScroll(true);
    setSelectedFixture(fixture);
  }, []);

  if (fixturesData?.allFixtures?.length === 0 || selectedFixture == null || !fixturesData?.allFixtures) {
    return (
      <View className="flex-1 bg-background">
        <SkeletonFixtures />
        <SkeletonMatches />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FixturesList
        fixtures={fixturesData?.allFixtures}
        selectedFixture={selectedFixture}
        handleFixturePress={handleFixturePress}
        animateScroll={animateScroll}
      />

      <MatchesList selectedFixture={selectedFixture} />
    </View>
  );
};

export default MatchesScreen;
