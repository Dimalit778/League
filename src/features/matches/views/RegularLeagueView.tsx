import { useFloatBottomTabsInset } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { MatchesTopBar } from '../components/shared/MatchesTopBar';
import FixtureListEngine from '../engines/FixtureListEngine';
import type { MatchCardType } from '../types';

export default function RegularLeagueView({
  matches,
  currentFixture,
  onRefresh,
}: {
  matches: MatchCardType[];
  currentFixture: number;
  onRefresh: () => void;
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
      <MatchesTopBar />
      <FixtureListEngine
        matches={matches}
        currentFixture={currentFixture}
        selectedFixture={selectedFixture}
        onSelectFixture={onSelectFixture}
        onRefresh={onRefresh}
        animateScroll={animateScroll}
        bottomInset={bottomInset}
        locale={locale}
      />
    </View>
  );
}
