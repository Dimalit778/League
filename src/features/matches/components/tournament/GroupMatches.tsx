import { useFloatBottomTabsInset } from '@/components/layout';
import { prefetchMatchTeamLogos } from '@/utils/prefetchTeamLogos';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
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
};

export default function GroupMatches({
  matches,
  onRefresh,
  selectedGroup: controlledSelectedGroup,
  onSelectGroup,
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
    if (!groups.includes(selectedGroup)) {
      setSelectedGroup(groups[0] ?? '');
    }
  }, [groups, selectedGroup, setSelectedGroup]);

  const matchesByGroup = useMemo(() => {
    return groups.reduce<Record<string, MatchWithPredictionsType[]>>((acc, group) => {
      acc[group] = matches
        .filter((m) => isGroupPhaseStage(m.stage) && normalizedGroupLetter(m.group) === group)
        .sort((a, b) => new Date(a.kick_off).getTime() - new Date(b.kick_off).getTime());
      return acc;
    }, {});
  }, [groups, matches]);

  useEffect(() => {
    if (matches.length === 0) return;
    void prefetchMatchTeamLogos(matches);
  }, [matches]);

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
        <View>
          {groups.map((group) => (
            <View key={group} style={group === selectedGroup ? styles.visibleGroup : styles.hiddenGroup}>
              {(matchesByGroup[group] ?? []).map((match) => {
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
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  visibleGroup: {
    display: 'flex',
  },
  hiddenGroup: {
    display: 'none',
  },
});
