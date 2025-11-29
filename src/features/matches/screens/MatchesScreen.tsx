import { Error } from '@/components/layout';
import { useGetCompetitionFixtures } from '@/features/leagues/hooks/useCompetition';
import SkeletonFixtures from '@/features/matches/components/FixturesSkeleton';
import FixturesList from '@/features/matches/components/matches/FixturesList';
import MatchesList from '@/features/matches/components/matches/MatchesList';
import SkeletonMatches from '@/features/matches/components/MatchesSkeleton';
import { useFocusEffect, usePathname } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

const MatchesScreen = () => {
  const { data, isLoading, error } = useGetCompetitionFixtures();
  const allFixtures = data?.allFixtures ?? [];
  const currentFixture = data?.currentFixture ?? 0;

  const pathname = usePathname();
  const [selectedFixture, setSelectedFixture] = useState<number>(currentFixture);
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
      if (preservedFixtureRef.current && isNavigatingToMatchRef.current) {
        setAnimateScroll(false);
        setSelectedFixture(preservedFixtureRef.current);
        preservedFixtureRef.current = null;
        isNavigatingToMatchRef.current = false;
      } else if (currentFixture && !preservedFixtureRef.current) {
        setAnimateScroll(false);
        setSelectedFixture(currentFixture);
      }
    }, [currentFixture])
  );

  const handleFixturePress = useCallback((fixture: number) => {
    setAnimateScroll(true);
    setSelectedFixture(fixture);
  }, []);

  if (isLoading || !selectedFixture) {
    return (
      <View className="flex-1 bg-background">
        <SkeletonFixtures />
        <SkeletonMatches />
      </View>
    );
  }

  if (error) return <Error error={error} />;

  return (
    <View className="flex-1 bg-background">
      <FixturesList
        fixtures={allFixtures}
        selectedFixture={selectedFixture}
        handleFixturePress={handleFixturePress}
        animateScroll={animateScroll}
      />

      <MatchesList selectedFixture={selectedFixture} />
    </View>
  );
};

export default MatchesScreen;
