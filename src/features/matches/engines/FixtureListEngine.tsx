import { formatDateRange } from '@/utils/formats';
import { useMemo } from 'react';
import { View } from 'react-native';
import { selectByFixture, selectFixtures } from '../model/selectors';
import type { MatchCardType } from '../types';
import { mapMatchToCardData } from '../utils/matchCard.mapper';
import FixturesList from './fixture-list/FixturesList';
import MatchesList from './fixture-list/MatchesList';

type FixtureListEngineProps = {
  matches: MatchCardType[];
  currentFixture: number;
  selectedFixture: number;
  onSelectFixture: (fixture: number) => void;
  onRefresh: () => void;
  animateScroll?: boolean;
  bottomInset?: number;
  locale: string;
  fixtures?: number[];
};

export default function FixtureListEngine({
  matches,
  currentFixture,
  selectedFixture,
  onSelectFixture,
  onRefresh,
  animateScroll = false,
  bottomInset = 0,
  locale,
  fixtures,
}: FixtureListEngineProps) {
  const allFixtures = useMemo(() => fixtures ?? selectFixtures(matches), [fixtures, matches]);

  const fixtureDateRanges = useMemo(() => {
    const ranges: Record<number, string> = {};
    for (const fixture of allFixtures) {
      const fixtureMatches = selectByFixture(matches, fixture).filter((m) => m.kick_off);
      if (fixtureMatches.length === 0) continue;
      const dates = fixtureMatches
        .map((m) => new Date(m.kick_off))
        .sort((a, b) => a.getTime() - b.getTime());
      ranges[fixture] = formatDateRange(
        dates[0].toISOString(),
        dates[dates.length - 1].toISOString(),
        locale,
      );
    }
    return ranges;
  }, [allFixtures, matches, locale]);

  const cards = useMemo(
    () => selectByFixture(matches, selectedFixture).map(mapMatchToCardData),
    [matches, selectedFixture],
  );

  return (
    <View className="flex-1">
      <FixturesList
        fixtures={allFixtures}
        selectedFixture={selectedFixture}
        currentFixture={currentFixture}
        handleFixturePress={onSelectFixture}
        animateScroll={animateScroll}
        fixtureDateRanges={fixtureDateRanges}
      />
      <MatchesList matches={cards} onRefresh={onRefresh} bottomInset={bottomInset} />
    </View>
  );
}
