import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { formatMatchdayDate } from '@/utils/formats';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { MatchWithPredictionsType } from '../../types';
import { isGroupPhaseStage } from '../../types/footballStages';
import { mapMatchToCardProps } from '../../utils/matchCard.mapper';
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

type MatchDaySection = {
  key: string;
  label: string;
  timestamp: number;
  matches: MatchWithPredictionsType[];
};

export default function GroupMatches({
  matches,
  onRefresh,
  selectedGroup: controlledSelectedGroup,
  onSelectGroup,
}: GroupMatchesProps) {
  const { language } = useTranslation();
  const locale = language === 'he' ? 'he-IL' : 'en-GB';
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

  const filteredMatches = useMemo(() => {
    if (!selectedGroup) return [];
    return matches.filter((m) => isGroupPhaseStage(m.stage) && normalizedGroupLetter(m.group) === selectedGroup);
  }, [matches, selectedGroup]);

  const matchDaySections = useMemo(() => {
    const sections = filteredMatches.reduce<Record<string, MatchDaySection>>((acc, match) => {
      const key = formatMatchdayDate(match.kick_off);
      const timestamp = new Date(match.kick_off).getTime();

      acc[key] = acc[key] ?? {
        key,
        label: formatMatchdayDate(match.kick_off, locale),
        timestamp: Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp,
        matches: [],
      };
      acc[key].matches.push(match);

      return acc;
    }, {});

    return Object.values(sections)
      .map((section) => ({
        ...section,
        matches: section.matches.sort((a, b) => new Date(a.kick_off).getTime() - new Date(b.kick_off).getTime()),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [filteredMatches, locale]);

  return (
    <View className="flex-1">
      <GroupTabs groups={groups} selectedGroup={selectedGroup} onSelectGroup={setSelectedGroup} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
      >
        <View>
          {matchDaySections.map((section) => (
            <View key={section.key} className="mb-2">
              <View className="mb-1 px-2">
                <CText variant="caption" className="text-white/90 ">
                  {section.label}
                </CText>
              </View>
              {section.matches.map((match) => {
                const card = mapMatchToCardProps(match);

                return (
                  <MatchCard
                    key={match.id}
                    id={card.id}
                    home={card.home}
                    away={card.away}
                    prediction={card.prediction}
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
