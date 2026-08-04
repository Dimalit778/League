import { Row } from '@/components/layout';
import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { getMatchCardMetrics, MATCH_CARD_HORIZONTAL_PADDING } from '../components/MatchCardBg';
import { selectKnockoutTies, type Tie } from '../model/knockout';
import type { MatchCardType } from '../types';
import { mapMatchToCardData } from '../utils/matchCard.mapper';
import { getKnockoutStages, getStageLabel } from '../utils/tournamentMatches';
import { KnockoutStageTabs } from './shared/TournamentTabs';
import { TieBracketConnector } from './TieBracketConnector';
import { TIE_BRACKET_RAIL_WIDTH } from './tieBracketGeometry';

function TieBlock({ tie }: { tie: Tie }) {
  const { width: screenWidth } = useWindowDimensions();

  // Reserve a real rail so stubs can meet a spine and exit — not just two parallel lines.
  const layoutWidth = screenWidth - TIE_BRACKET_RAIL_WIDTH + MATCH_CARD_HORIZONTAL_PADDING;
  const { height: cardHeight } = getMatchCardMetrics(layoutWidth);

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
        layoutWidth={tie.legs.length === 2 ? layoutWidth : undefined}
        onPress={() => router.push(`/(app)/(league)/match/${leg.id}`)}
      />
    );
  });

  if (tie.legs.length !== 2) {
    return <>{cards}</>;
  }

  return (
    <Row className="relative">
      <View className="pe-3">{cards}</View>
      <TieBracketConnector cardHeight={cardHeight} railWidth={TIE_BRACKET_RAIL_WIDTH} />
    </Row>
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
        ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
      />
    </View>
  );
}
