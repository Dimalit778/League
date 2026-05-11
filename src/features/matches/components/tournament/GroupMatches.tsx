import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativeWind';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { MatchWithPredictionsType } from '../../types';
import { getTournamentGroups, GROUP_STAGE, normalizedGroupLetter } from '../../utils/tournamentMatches';
import Match from './Match';

type GroupMatchesProps = {
  matches: MatchWithPredictionsType[];
  onRefresh: () => void;
};

type MatchDaySection = {
  key: string;
  label: string;
  timestamp: number;
  matches: MatchWithPredictionsType[];
};

type SelectionTabsProps = {
  items: string[];
  selected: string;
  labelFor: (item: string) => string;
  onSelect: (item: string) => void;
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

const SelectionTabs = ({ items, selected, labelFor, onSelect }: SelectionTabsProps) => {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
    >
      {items.map((item) => {
        const active = selected === item;
        return (
          <Pressable
            key={item}
            onPress={() => onSelect(item)}
            className={cn(
              'rounded-lg justify-center items-center mx-1 px-4 py-1.5 min-w-[60px]',
              active ? 'bg-primary' : 'border border-border',
            )}
          >
            <CText variant="bodyBold" className={active ? 'text-background' : 'text-text'}>
              {t('Group')} {labelFor(item)}
            </CText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};
export default function GroupMatches({ matches, onRefresh }: GroupMatchesProps) {
  const { t, language } = useTranslation();
  const locale = language === 'he' ? 'he-IL' : 'en-GB';
  const groups = useMemo(() => getTournamentGroups(matches), [matches]);
  const [selectedGroup, setSelectedGroup] = useState(groups[0] ?? '');

  useEffect(() => {
    setSelectedGroup((prev) => (groups.includes(prev) ? prev : (groups[0] ?? '')));
  }, [groups]);

  const filteredMatches = useMemo(() => {
    if (!selectedGroup) return [];
    return matches.filter((m) => {
      if (m.stage !== GROUP_STAGE) return false;
      return normalizedGroupLetter(m.group) === selectedGroup;
    });
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
    <View>
      <SelectionTabs items={groups} selected={selectedGroup} labelFor={(group) => group} onSelect={setSelectedGroup} />
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
