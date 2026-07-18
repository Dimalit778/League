import { useTranslation } from '@/hooks/useTranslation';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import GroupsEngine from '../engines/GroupsEngine';
import KnockoutEngine from '../engines/KnockoutEngine';
import { HorizontalTabs } from '../engines/shared/TournamentTabs';
import type { MatchCardType } from '../types';
import { isFirstPhaseStage, isKnockoutStage, type TournamentView } from '../utils/tournamentMatches';

export default function GroupsKnockoutView({
  matches,
  currentStage,
  onRefresh,
}: {
  matches: MatchCardType[];
  currentStage: string | null;
  onRefresh: () => void;
}) {
  const { t } = useTranslation();
  const groupMatches = useMemo(() => matches.filter((m) => isFirstPhaseStage(m.stage)), [matches]);
  const knockout = useMemo(() => matches.filter((m) => isKnockoutStage(m.stage)), [matches]);
  const [view, setView] = useState<TournamentView>(
    isKnockoutStage(currentStage) ? 'knockout' : 'groups',
  );

  return (
    <View className="flex-1">
      <HorizontalTabs
        value={view}
        onChange={setView}
        options={[
          { value: 'groups', label: t('Groups') },
          { value: 'knockout', label: t('Knockout') },
        ]}
      />
      {view === 'groups' ? (
        <GroupsEngine matches={groupMatches} onRefresh={onRefresh} />
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
