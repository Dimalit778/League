import FixturesList from '@/components/matches/FixturesList';
import MatchesList from '@/components/matches/MatchesList';
import { useMemberLeague } from '@/hooks/useMembers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

interface FixtureMatchesProps {
  memberId: string;
  competitionId: number;
}

export default function FixtureMatches({ memberId, competitionId }: FixtureMatchesProps) {
  const { data: league, isLoading: isLoadingLeague } = useMemberLeague(memberId);
  const [selectedFixture, setSelectedFixture] = useState<number | null>(null);
  const [animateScroll, setAnimateScroll] = useState(false);

  const competition = league?.competition;
  const currentFixture = competition?.current_fixture as number | null;
  const totalFixtures = competition?.total_fixtures as number | null;

  const fixtures = useMemo(
    () => (totalFixtures ? Array.from({ length: totalFixtures }, (_, i) => i + 1) : []),
    [totalFixtures]
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

  if (isLoadingLeague || !league || !competition) {
    return null;
  }

  if (!fixtures.length || selectedFixture === null) {
    return null;
  }

  return (
    <View className="flex-1">
      <View className="mt-2">
        <FixturesList
          fixtures={fixtures}
          selectedFixture={selectedFixture}
          handleFixturePress={handleFixturePress}
          animateScroll={animateScroll}
        />
      </View>
      {selectedFixture && competition && memberId && (
        <MatchesList selectedFixture={selectedFixture} competitionId={competition.id} memberId={memberId} />
      )}
    </View>
  );
}
