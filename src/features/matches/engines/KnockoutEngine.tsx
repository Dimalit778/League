import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { selectKnockoutTies, type Tie } from '../model/knockout';
import type { MatchCardType } from '../types';
import { mapMatchToCardData } from '../utils/matchCard.mapper';
import { getKnockoutStages, getStageLabel } from '../utils/tournamentMatches';
import { KnockoutStageTabs } from './shared/TournamentTabs';

function TieBlock({ tie }: { tie: Tie }) {
  const { t } = useTranslation();
  return (
    <View className="mb-3 rounded-2xl border border-border ">
      {tie.legs.map((leg) => {
        const card = mapMatchToCardData(leg);
        return (
          <MatchCard
            key={leg.id}
            id={card.id}
            home={card.home}
            away={card.away}
            prediction={card.prediction}
            predictionStatus={card.predictionStatus}
            status={card.status}
            date={card.date}
            time={card.time}
            onPress={() => router.push(`/(app)/(league)/match/${leg.id}`)}
          />
        );
      })}
      {tie.aggregate && (
        <Text className="text-sm text-muted mt-1 text-center">
          {t('Aggregate')}: {tie.aggregate.home}–{tie.aggregate.away}
        </Text>
      )}
    </View>
  );
}

export default function KnockoutEngine({
  matches,
  onRefresh,
  initialStage,
}: {
  matches: MatchCardType[];
  onRefresh: () => void;
  initialStage?: string;
}) {
  const { t } = useTranslation();
  const ties = useMemo(() => selectKnockoutTies(matches), [matches]);
  const stages = useMemo(() => getKnockoutStages(matches), [matches]);
  const [selectedStage, setSelectedStage] = useState(initialStage ?? stages[0] ?? '');
  const activeStage = stages.includes(selectedStage) ? selectedStage : (stages[0] ?? '');
  const stageTies = useMemo(() => ties.filter((tie) => tie.stage === activeStage), [ties, activeStage]);

  if (stages.length === 0) {
    return <Text className="text-text mt-6 text-center">{t('No matches found')}</Text>;
  }

  return (
    <View className="flex-1">
      <KnockoutStageTabs
        stages={stages}
        selectedStage={activeStage}
        onSelectStage={setSelectedStage}
        getLabel={getStageLabel}
      />
      <FlatList
        data={stageTies}
        renderItem={({ item }) => <TieBlock tie={item} />}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1, paddingHorizontal: 16 }}
      />
    </View>
  );
}
