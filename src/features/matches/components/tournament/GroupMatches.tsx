import { useFloatBottomTabsInset } from '@/components/layout';
import { prefetchMatchTeamLogos } from '@/utils/prefetchTeamLogos';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { MatchWithPredictionsType } from '../../types';
import { isGroupPhaseStage } from '../../types/footballStages';
import { mapMatchToCardData } from '../../utils/matchCard.mapper';
import { getTournamentGroups, normalizedGroupLetter } from '../../utils/tournamentMatches';
import { MatchCard } from '../MatchCard';
import { GroupTabs } from './TournametTabs';

type GroupMatchesProps = {
  matches: MatchWithPredictionsType[];
  onRefresh: () => void;
  selectedGroup?: string;
  onSelectGroup?: (group: string) => void;
  showGroupTabs?: boolean;
  initialGroup?: string;
};

export default function GroupMatches({
  matches,
  onRefresh,
  selectedGroup: controlledSelectedGroup,
  onSelectGroup,
  initialGroup,
}: GroupMatchesProps) {
  const bottomTabsInset = useFloatBottomTabsInset();
  const groups = useMemo(() => getTournamentGroups(matches), [matches]);
  const [internalSelectedGroup, setInternalSelectedGroup] = useState(groups[0] ?? '');
  const selectedGroup = controlledSelectedGroup ?? internalSelectedGroup;
  const setSelectedGroup = useCallback(
    (group: string) => {
      if (onSelectGroup) onSelectGroup(group);
      else setInternalSelectedGroup(group);
    },
    [onSelectGroup],
  );

  useEffect(() => {
    if (controlledSelectedGroup != null) return;

    setInternalSelectedGroup((current) => {
      if (groups.includes(current)) return current;
      if (initialGroup && groups.includes(initialGroup)) return initialGroup;
      return groups[0] ?? '';
    });
  }, [controlledSelectedGroup, groups, initialGroup]);

  const selectedGroupMatches = useMemo(
    () =>
      matches
        .filter((m) => isGroupPhaseStage(m.stage) && normalizedGroupLetter(m.group) === selectedGroup)
        .sort((a, b) => new Date(a.kick_off).getTime() - new Date(b.kick_off).getTime()),
    [matches, selectedGroup],
  );

  useEffect(() => {
    if (selectedGroupMatches.length === 0) return;
    void prefetchMatchTeamLogos(selectedGroupMatches);
  }, [selectedGroupMatches]);

  return (
    <View className="flex-1">
      <GroupTabs groups={groups} selectedGroup={selectedGroup} onSelectGroup={setSelectedGroup} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: bottomTabsInset + 20,
          flexGrow: 1,
        }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
      >
        {selectedGroupMatches.map((match) => {
          const card = mapMatchToCardData(match);

          return (
            <MatchCard
              key={match.id}
              id={card.id}
              home={card.home}
              away={card.away}
              prediction={card.prediction}
              predictionStatus={card.predictionStatus}
              status={card.status}
              logoVariant="flag"
              date={card.date}
              time={card.time}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
