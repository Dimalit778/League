import { useTranslation } from '@/hooks/useTranslation';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { MatchesTopBar } from '../components/shared/MatchesTopBar';
import GroupsEngine from '../engines/GroupsEngine';
import KnockoutEngine from '../engines/KnockoutEngine';
import { TournamentViewTabs } from '../engines/shared/TournamentTabs';
import type { MatchListItem } from '../types';
import { isFirstPhaseStage, isKnockoutStage, type TournamentView } from '../utils/tournamentMatches';

export default function GroupsKnockoutView({
  matches,
  currentStage,
  onRefresh,
  refreshing,
}: {
  matches: MatchListItem[];
  currentStage: string | null;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const { t } = useTranslation();
  const groupMatches = useMemo(() => matches.filter((m) => isFirstPhaseStage(m.stage)), [matches]);
  const knockout = useMemo(() => matches.filter((m) => isKnockoutStage(m.stage)), [matches]);
  const [view, setView] = useState<TournamentView>(isKnockoutStage(currentStage) ? 'knockout' : 'groups');

  return (
    <View className="flex-1 ">
      <MatchesTopBar center={<TournamentViewTabs value={view} onChange={setView} firstPhaseLabel={t('Groups')} />} />

      {view === 'groups' ? (
        <GroupsEngine matches={groupMatches} onRefresh={onRefresh} refreshing={refreshing} />
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
