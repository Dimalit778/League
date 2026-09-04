import { ScreenHeader, useFloatBottomTabsInset } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import FixtureListEngine from '../engines/FixtureListEngine';
import type { MatchListItem } from '../types';

export default function RegularLeagueView({
  matches,
  currentFixture,
  onRefresh,
  refreshing,
}: {
  matches: MatchListItem[];
  currentFixture: number;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const bottomInset = useFloatBottomTabsInset();
  const { language } = useTranslation();
  const locale = language === 'he' ? 'he-IL' : 'en-GB';
  const [selectedFixture, setSelectedFixture] = useState(currentFixture || 1);
  const [animateScroll, setAnimateScroll] = useState(false);

  const onSelectFixture = useCallback((fixture: number) => {
    setAnimateScroll(true);
    setSelectedFixture(fixture);
  }, []);

  return (
    <View className="flex-1">
      <ScreenHeader title="Matches" />
      <FixtureListEngine
        matches={matches}
        currentFixture={currentFixture}
        selectedFixture={selectedFixture}
        onSelectFixture={onSelectFixture}
        onRefresh={onRefresh}
        refreshing={refreshing}
        animateScroll={animateScroll}
        bottomInset={bottomInset}
        locale={locale}
      />
    </View>
  );
}
