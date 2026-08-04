import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsRTL } from '@/providers/LanguageProvider';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { getMatchCardMetrics } from '../components/MatchCardBg';
import { selectKnockoutTies, type Tie } from '../model/knockout';
import type { MatchCardType } from '../types';
import { mapMatchToCardData } from '../utils/matchCard.mapper';
import { getKnockoutStages, getStageLabel } from '../utils/tournamentMatches';
import { TieBracketConnector } from './TieBracketConnector';
import { KnockoutStageTabs } from './shared/TournamentTabs';

function TieBlock({ tie }: { tie: Tie }) {
  const { width: screenWidth } = useWindowDimensions();
  const isRTL = useIsRTL();
  const { height: cardHeight, width: cardWidth } = getMatchCardMetrics(screenWidth);
  const cardsGap = 8;
  const cards = tie.legs.map((leg) => {
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
  });

  if (tie.legs.length !== 2) {
    return <>{cards}</>;
  }

  const sidePadding = Math.max(0, (screenWidth - cardWidth) / 2);
  const minRail = 28;
  const railWidth = Math.max(sidePadding, minRail);
  const nudge = Math.max(0, railWidth - sidePadding);

  return (
    <View
      style={{
        position: 'relative',
        paddingLeft: !isRTL ? nudge : 0,
        paddingRight: isRTL ? nudge : 0,
      }}
    >
      <View style={{ gap: cardsGap }}>{cards}</View>
      <TieBracketConnector cardHeight={cardHeight} cardsGap={cardsGap} railWidth={railWidth} />
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
      />
    </View>
  );
}
