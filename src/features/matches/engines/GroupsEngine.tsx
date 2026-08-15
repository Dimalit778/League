import { useFloatBottomTabsInset } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { selectGroups } from '../model/selectors';
import type { MatchCardType } from '../types';
import { mapMatchToCardData } from '../utils/matchCard.mapper';
import LeagueStandingsTable from './groups/LeagueStandingsTable';
import { GroupTabs } from './shared/TournamentTabs';

export default function GroupsEngine({ matches, onRefresh }: { matches: MatchCardType[]; onRefresh: () => void }) {
  const bottomInset = useFloatBottomTabsInset();
  const { language } = useTranslation();
  const locale = language === 'he' ? 'he-IL' : 'en-GB';
  const { groups, matchesByGroup, standingsByGroup } = useMemo(() => selectGroups(matches), [matches]);
  const [selectedGroup, setSelectedGroup] = useState(groups[0] ?? '');
  const activeGroup = groups.includes(selectedGroup) ? selectedGroup : (groups[0] ?? '');

  return (
    <View className="flex-1">
      <GroupTabs groups={groups} selectedGroup={activeGroup} onSelectGroup={setSelectedGroup} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 12, paddingBottom: bottomInset + 24, flexGrow: 1 }}
      >
        <LeagueStandingsTable rows={standingsByGroup[activeGroup] ?? []} />
        <View className="mt-4 gap-2">
          {(matchesByGroup[activeGroup] ?? []).map((match) => {
            const card = mapMatchToCardData(match, locale);
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
                onPress={() => router.push(`/(app)/(league)/match/${match.id}`)}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
