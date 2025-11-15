import { useGetLeagueWithCompetition } from '@/features/leagues/hooks/useLeagues';
import SkeletonFixtures from '@/features/matches/components/FixturesSkeleton';
import FixturesList from '@/features/matches/components/matches/FixturesList';
import MatchesList from '@/features/matches/components/matches/MatchesList';
import SkeletonMatches from '@/features/matches/components/MatchesSkeleton';
import { useAuthStore } from '@/store/AuthStore';
import { useMemberStore } from '@/store/MemberStore';
import { useFocusEffect, usePathname } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

const MatchesScreen = () => {
  const member = useMemberStore((s) => s.member);
  const userId = useAuthStore((s) => s.userId);
  const leagueId = useMemberStore((s) => s.leagueId);

  const { data: league } = useGetLeagueWithCompetition(leagueId!);
  const competition = league?.competition;
  const totalFixtures = competition?.total_fixtures ?? 0;
  const currentFixture = competition?.current_fixture ?? 0;
  const pathname = usePathname();

  const [selectedFixture, setSelectedFixture] = useState<number | null>(null);
  const [animateScroll, setAnimateScroll] = useState(false);
  const preservedFixtureRef = useRef<number | null>(null);
  const previousPathnameRef = useRef<string>(pathname);
  const isNavigatingToMatchRef = useRef(false);

  const fixtures = useMemo(
    () => (totalFixtures ? Array.from({ length: totalFixtures }, (_, i) => i + 1) : []),
    [totalFixtures]
  );

  // Track pathname changes to detect navigation to/from match detail
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
      } else if (currentFixture && !preservedFixtureRef.current) {
        // Otherwise, reset to current fixture (coming from other pages)
        setAnimateScroll(false);
        setSelectedFixture(currentFixture);
      }
    }, [currentFixture])
  );

  const handleFixturePress = useCallback((fixture: number) => {
    setAnimateScroll(true);
    setSelectedFixture(fixture);
  }, []);

  if (!fixtures.length || selectedFixture == null) {
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
        fixtures={fixtures}
        selectedFixture={selectedFixture ?? 1}
        handleFixturePress={handleFixturePress}
        animateScroll={animateScroll}
      />

      {selectedFixture && competition && userId && (
        <MatchesList selectedFixture={selectedFixture} competitionId={competition.id} memberId={member?.id!} />
      )}
    </View>
  );
};

export default MatchesScreen;
