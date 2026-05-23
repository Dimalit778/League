import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { MatchWithPredictionsType } from '../../types';
import { isGroupPhaseStage } from '../../types/footballStages';
import { getTournamentGroups, normalizedGroupLetter } from '../../utils/tournamentMatches';
import Match from './Match';
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

const getLocalDayKey = (date: string) => {
  const dateObj = new Date(date);
  if (Number.isNaN(dateObj.getTime())) return date;

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatMatchDayLabel = (date: string, locale: string) => {
  const dateObj = new Date(date);
  if (Number.isNaN(dateObj.getTime())) return date;

  const weekday = dateObj.toLocaleDateString(locale, { weekday: 'long' }).replace(/^יום\s+/, '');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');

  return `${weekday} ${day}.${month}`;
};

export default function GroupMatches({
  matches,
  onRefresh,
  selectedGroup: controlledSelectedGroup,
  onSelectGroup,
  showGroupTabs = true,
}: GroupMatchesProps) {
  const { t, language } = useTranslation();
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
      const key = getLocalDayKey(match.kick_off);
      const timestamp = new Date(match.kick_off).getTime();

      acc[key] = acc[key] ?? {
        key,
        label: formatMatchDayLabel(match.kick_off, locale),
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
          {matchDaySections.length > 0 ? (
            matchDaySections.map((section) => (
              <View key={section.key} className="mb-2">
                <View className="mb-1 px-2">
                  <CText variant="caption" className="text-white/90 ">
                    {section.label}
                  </CText>
                </View>
                {section.matches.map((match) => (
                  <Match key={match.id} match={match} />
                ))}
              </View>
            ))
          ) : (
            <CText className="text-text text-center mt-6">{t('No matches found')}</CText>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
