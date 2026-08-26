import { formatDateRange } from '@/utils/formats';
import { useMemo } from 'react';
import { View } from 'react-native';
import { selectFixtureIndex } from '../model/selectors';
import type { MatchListItem } from '../types';
import { mapMatchToCardData } from '../utils/matchCard.mapper';
import FixturesList from './fixture-list/FixturesList';
import MatchesList from './fixture-list/MatchesList';

type FixtureListEngineProps = {
  matches: MatchListItem[];
  currentFixture: number;
  selectedFixture: number;
  onSelectFixture: (fixture: number) => void;
  onRefresh: () => void;
  refreshing: boolean;
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
  refreshing,
  animateScroll = false,
  bottomInset = 0,
  locale,
  fixtures,
}: FixtureListEngineProps) {
  const fixtureIndex = useMemo(() => selectFixtureIndex(matches), [matches]);
  const allFixtures = fixtures ?? fixtureIndex.fixtures;

  const fixtureDateRanges = useMemo(() => {
    const ranges: Record<number, string> = {};
    for (const fixture of allFixtures) {
      const bounds = fixtureIndex.dateBoundsByFixture.get(fixture);
      if (!bounds) continue;

      ranges[fixture] = formatDateRange(
        new Date(bounds.start).toISOString(),
        new Date(bounds.end).toISOString(),
        locale,
      );
    }
    return ranges;
  }, [allFixtures, fixtureIndex, locale]);

  const cards = useMemo(
    () =>
      (fixtureIndex.matchesByFixture.get(selectedFixture) ?? []).map((match) =>
        mapMatchToCardData(match, locale),
      ),
    [fixtureIndex, locale, selectedFixture],
  );

  return (
    <View className="flex-1 ">
      <FixturesList
        fixtures={allFixtures}
        selectedFixture={selectedFixture}
        currentFixture={currentFixture}
        handleFixturePress={onSelectFixture}
        animateScroll={animateScroll}
        fixtureDateRanges={fixtureDateRanges}
      />
      <MatchesList
        matches={cards}
        onRefresh={onRefresh}
        refreshing={refreshing}
        bottomInset={bottomInset}
      />
    </View>
  );
}
