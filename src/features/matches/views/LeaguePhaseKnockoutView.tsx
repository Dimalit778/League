import { useTranslation } from '@/hooks/useTranslation';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import FixtureListEngine from '../engines/FixtureListEngine';
import KnockoutEngine from '../engines/KnockoutEngine';
import { HorizontalTabs } from '../engines/shared/TournamentTabs';
import type { MatchCardType } from '../types';
import { isFirstPhaseStage, isKnockoutStage, type TournamentView } from '../utils/tournamentMatches';

export default function LeaguePhaseKnockoutView({
  matches,
  currentFixture,
  currentStage,
  onRefresh,
}: {
  matches: MatchCardType[];
  currentFixture: number;
  currentStage: string | null;
  onRefresh: () => void;
}) {
  const { t, language } = useTranslation();
  const locale = language === 'he' ? 'he-IL' : 'en-GB';
  const leaguePhase = useMemo(() => matches.filter((m) => isFirstPhaseStage(m.stage)), [matches]);
  const knockout = useMemo(() => matches.filter((m) => isKnockoutStage(m.stage)), [matches]);
  const [view, setView] = useState<TournamentView>(
    isKnockoutStage(currentStage) ? 'knockout' : 'groups',
  );
  const [selectedFixture, setSelectedFixture] = useState(currentFixture || 1);
  const onSelectFixture = useCallback((f: number) => setSelectedFixture(f), []);

  return (
    <View className="flex-1">
      <HorizontalTabs
        value={view}
        onChange={setView}
        options={[
          { value: 'groups', label: t('League Phase') },
          { value: 'knockout', label: t('Knockout') },
        ]}
      />
      {view === 'groups' ? (
        <FixtureListEngine
          matches={leaguePhase}
          currentFixture={currentFixture}
          selectedFixture={selectedFixture}
          onSelectFixture={onSelectFixture}
          onRefresh={onRefresh}
          locale={locale}
        />
      ) : (
        <KnockoutEngine
          matches={knockout}
          onRefresh={onRefresh}
          initialStage={currentStage ?? undefined}
        />
      )}
    </View>
  );
}
