import { MobileTopBar, useFloatBottomTabsInset } from '@/components/layout';
import { useTranslation } from '@/hooks/useTranslation';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const { top } = useSafeAreaInsets();
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
      <View style={{ paddingTop: top }} className="px-3 pb-2">
        <MobileTopBar />
      </View>
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
