import { Screen } from '@/components/layout';
import { BackButton, Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { Image as ExpoImage } from 'expo-image';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import GroupStandingsTable from '../components/GroupStandingsTable';
import GroupTabs from '../components/GroupTabs';
import KnockoutMatchesList from '../components/KnockoutMatchesList';
import KnockoutStageTabs from '../components/KnockoutStageTabs';
import MatchdaySection from '../components/MatchdaySection';
import StageToggle from '../components/StageToggle';
import WCLeaderboardPreview from '../components/WCLeaderboardPreview';
import { WORLD_CUP_COMPETITION } from '../mock/competition';
import { computeStandings } from '../mock/groups';
import { WC_LEADERBOARD } from '../mock/leaderboard';
import { WC_GROUP_MATCHES, getGroupMatches, getKnockoutMatches } from '../mock/matches';
import { WCGroup, WCKnockoutStage, WCMatchday } from '../types';

const MATCHDAYS: WCMatchday[] = [1, 2, 3];

export default function WorldCupPreviewScreen() {
  const { t } = useTranslation();
  const [view, setView] = useState<'groups' | 'knockout'>('groups');
  const [selectedGroup, setSelectedGroup] = useState<WCGroup>('A');
  const [selectedStage, setSelectedStage] = useState<WCKnockoutStage>('ROUND_OF_16');

  const standings = useMemo(() => computeStandings(selectedGroup, WC_GROUP_MATCHES), [selectedGroup]);
  const knockoutMatches = useMemo(() => getKnockoutMatches(selectedStage), [selectedStage]);

  return (
    <Screen edges={['top']}>
      <BackButton title={t('World Cup')} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="flex-row items-center justify-center gap-3 mt-1 mb-2 px-3">
          <ExpoImage
            source={WORLD_CUP_COMPETITION.logo}
            style={{ width: 48, height: 48 }}
            cachePolicy="memory-disk"
            contentFit="contain"
          />
          <View className="items-start">
            <Text variant="h3" bold>
              {t('World Cup')}
            </Text>
            <View className="px-2 py-0.5 rounded bg-primary/20 self-start">
              <Text variant="small" className="text-primary">
                {t('Preview')}
              </Text>
            </View>
          </View>
        </View>

        <WCLeaderboardPreview members={WC_LEADERBOARD} />

        <StageToggle value={view} onChange={setView} />

        {view === 'groups' ? (
          <View>
            <GroupTabs selected={selectedGroup} onSelect={setSelectedGroup} />
            <GroupStandingsTable rows={standings} />
            {MATCHDAYS.map((md) => (
              <MatchdaySection key={md} matchday={md} matches={getGroupMatches(selectedGroup, md)} />
            ))}
          </View>
        ) : (
          <View>
            <KnockoutStageTabs selected={selectedStage} onSelect={setSelectedStage} />
            <KnockoutMatchesList matches={knockoutMatches} />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
