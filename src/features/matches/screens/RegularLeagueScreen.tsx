import { Error, Screen, useFloatBottomTabsInset } from '@/components/layout';
import { useGetCompetitionsDetails } from '@/features/leagues/hooks/useCompetition';
import SkeletonFixtures from '@/features/matches/components/FixturesSkeleton';
import SkeletonMatches from '@/features/matches/components/MatchesSkeleton';
import FixturesList from '@/features/matches/components/regular-league/FixturesList';
import { useTranslation } from '@/hooks/useTranslation';
import { usePrimaryMember } from '@/store/MemberStore';
import { formatDateRange } from '@/utils/formats';
import { useFocusEffect, usePathname } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MatchesList from '../components/regular-league/MatchesList';
import { useGetMatchesByFixture } from '../hooks/useMatches';
import { mapMatchToCardData } from '../utils/matchCard.mapper';

export default function RegularLeagueScreen() {
  const { memberId, competitionId } = usePrimaryMember();

  const bottomTabsInset = useFloatBottomTabsInset();

  const { data: matchMeta, isLoading: metaLoading, error: metaError } = useGetCompetitionsDetails();
  const { language } = useTranslation();
  const locale = language === 'he' ? 'he-IL' : 'en-GB';

  const allFixtures = useMemo(() => matchMeta?.allFixtures ?? [], [matchMeta?.allFixtures]);
  const currentFixture = matchMeta?.currentFixture ?? 1;

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

    if (isOnMatchDetail && wasOnMatchesPage && selectedFixture) {
      preservedFixtureRef.current = selectedFixture;
      isNavigatingToMatchRef.current = true;
    }

    if (isOnMatchesPage && wasOnMatchDetail && preservedFixtureRef.current) {
      isNavigatingToMatchRef.current = true;
    }

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
    }, [currentFixture]),
  );

  const handleFixturePress = useCallback((fixture: number) => {
    setAnimateScroll(true);
    setSelectedFixture(fixture);
  }, []);

  const {
    data: matches,
    isLoading: matchesLoading,
    refetch: matchesRefetch,
    error: matchesError,
  } = useGetMatchesByFixture({
    selectedFixture,
    competitionId,
    memberId,
    enabled: !!matchMeta,
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
        ranges[fixture] = formatDateRange(startDate.toISOString(), endDate.toISOString(), locale);
      }
    });

    return ranges;
  }, [matches, allFixtures, locale]);
  const matchesList = useMemo(() => matches?.map(mapMatchToCardData) ?? [], [matches]);

  if (metaError || matchesError) return <Error error={metaError || matchesError || ''} />;

  if (metaLoading || !matchMeta || matchesLoading || !selectedFixture) {
    return (
      <Screen>
        <SkeletonFixtures />
        <SkeletonMatches />
      </Screen>
    );
  }

  return (
    <Screen className="pt-2">
      <FixturesList
        fixtures={allFixtures}
        selectedFixture={selectedFixture}
        currentFixture={currentFixture}
        handleFixturePress={handleFixturePress}
        animateScroll={animateScroll}
        fixtureDateRanges={fixtureDateRanges}
      />

      <MatchesList matches={matchesList} onRefresh={matchesRefetch} bottomInset={bottomTabsInset} />
    </Screen>
  );
}
