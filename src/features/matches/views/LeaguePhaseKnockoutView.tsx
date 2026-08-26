import { useTranslation } from '@/hooks/useTranslation';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { MatchesTopBar } from '../components/shared/MatchesTopBar';
import FixtureListEngine from '../engines/FixtureListEngine';
import KnockoutEngine from '../engines/KnockoutEngine';
import { TournamentViewTabs } from '../engines/shared/TournamentTabs';
import type { MatchListItem } from '../types';
import { isFirstPhaseStage, isKnockoutStage, type TournamentView } from '../utils/tournamentMatches';

export default function LeaguePhaseKnockoutView({
  matches,
  currentFixture,
  currentStage,
  onRefresh,
  refreshing,
}: {
  matches: MatchListItem[];
  currentFixture: number;
  currentStage: string | null;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const { t, language } = useTranslation();

  const locale = language === 'he' ? 'he-IL' : 'en-GB';
  const leaguePhase = useMemo(() => matches.filter((m) => isFirstPhaseStage(m.stage)), [matches]);
  const knockout = useMemo(() => matches.filter((m) => isKnockoutStage(m.stage)), [matches]);
  const [view, setView] = useState<TournamentView>(isKnockoutStage(currentStage) ? 'knockout' : 'groups');
  const [selectedFixture, setSelectedFixture] = useState(currentFixture || 1);
  const onSelectFixture = useCallback((f: number) => setSelectedFixture(f), []);

  return (
    <View className="flex-1">
      <MatchesTopBar
        center={<TournamentViewTabs value={view} onChange={setView} firstPhaseLabel={t('League Phase')} />}
      />

      {view === 'groups' ? (
        <FixtureListEngine
          matches={leaguePhase}
          currentFixture={currentFixture}
          selectedFixture={selectedFixture}
          onSelectFixture={onSelectFixture}
          onRefresh={onRefresh}
          refreshing={refreshing}
          locale={locale}
        />
      ) : (
        <KnockoutEngine
          matches={knockout}
          onRefresh={onRefresh}
          refreshing={refreshing}
          initialStage={currentStage ?? undefined}
        />
      )}
    </View>
  );
}
