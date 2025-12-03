import { Error } from '@/components/layout';
import { useGetCompetitionFixtures } from '@/features/leagues/hooks/useCompetition';
import SkeletonFixtures from '@/features/matches/components/FixturesSkeleton';
import FixturesList from '@/features/matches/components/matches/FixturesList';
import SkeletonMatches from '@/features/matches/components/MatchesSkeleton';
import { useMemberStore } from '@/store/MemberStore';
import { formatDateRange } from '@/utils/formats';
import { useFocusEffect, usePathname } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import MatchesList from '../components/matches/MatchesList';
import { useGetMatches } from '../hooks/useMatches';

const MatchesScreen = () => {
  const { data: fixturesData, isLoading: fixturesLoading, error: fixturesError } = useGetCompetitionFixtures();
  const memberId = useMemberStore((s) => s.memberId);
  const competitionId = useMemberStore((s) => s.competitionId);
  const allFixtures = useMemo(() => fixturesData?.allFixtures ?? [], [fixturesData?.allFixtures]);
  const currentFixture = fixturesData?.currentFixture ?? 0;

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

  const {
    data: matches,
    isLoading: matchesLoading,
    // isFetching: matchesFetching,
    // isRefetching: matchesRefetching,
    refetch: matchesRefetch,
    error: matchesError,
  } = useGetMatches({
    selectedFixture,
    competitionId,
    memberId: memberId,
  });

  const fixtureDateRanges = useMemo(() => {
    if (!matches) return {};
    const ranges: Record<number, string> = {};

    allFixtures.forEach((fixture) => {
      const fixtureMatches = matches.filter((m) => m.fixture === fixture && m.kick_off);
      if (fixtureMatches.length === 0) return;

      const dates = fixtureMatches.map((m) => new Date(m.kick_off)).sort((a, b) => a.getTime() - b.getTime());

      const startDate = dates[0];
      const endDate = dates[dates.length - 1];

      if (startDate && endDate) {
        ranges[fixture] = formatDateRange(startDate.toISOString(), endDate.toISOString());
      }
    });

    return ranges;
  }, [matches, allFixtures]);

  if (fixturesLoading || matchesLoading || !selectedFixture) {
    return (
      <View className="flex-1 bg-background">
        <SkeletonFixtures />
        <SkeletonMatches />
      </View>
    );
  }

  if (fixturesError) return <Error error={fixturesError} />;
  if (matchesError) return <Error error={matchesError} />;

  return (
    <View className="flex-1 bg-background">
      <FixturesList
        fixtures={allFixtures}
        selectedFixture={selectedFixture}
        currentFixture={currentFixture}
        handleFixturePress={handleFixturePress}
        animateScroll={animateScroll}
        fixtureDateRanges={fixtureDateRanges}
      />
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={false} onRefresh={matchesRefetch} />}
        showsVerticalScrollIndicator={false}
      >
        <MatchesList matches={matches ?? []} />
      </ScrollView>
    </View>
  );
};

export default MatchesScreen;
