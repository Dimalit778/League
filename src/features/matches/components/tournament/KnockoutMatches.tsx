import { useFloatBottomTabsInset } from '@/components/layout';
import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsRTL } from '@/providers/LanguageProvider';
import { router } from 'expo-router';
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { MatchWithPredictionsType } from '../../types';
import { mapMatchToCardProps } from '../../utils/matchCard.mapper';
import {
  getKnockoutStages,
  getStageLabel,
} from '../../utils/tournamentMatches';
import { MatchCard } from '../MatchCard';
import { KnockoutStageTabs } from './TournametTabs';

const getStageIndexFromOffset = (
  offset: number,
  pageWidth: number,
  stageCount: number,
  isRTL: boolean,
) => {
  const pageIndex = Math.round(offset / pageWidth);
  if (!isRTL) return Math.max(0, Math.min(stageCount - 1, pageIndex));
  return Math.max(0, Math.min(stageCount - 1, stageCount - pageIndex - 1));
};

type KnockoutMatchesProps = {
  matches: MatchWithPredictionsType[];
  onRefresh: () => void;
  selectedStage?: string;
  onSelectStage?: (stage: string) => void;
  showStageTabs?: boolean;
};

function KnockoutMatchCard({
  match,
  isScrollingRef,
}: {
  match: MatchWithPredictionsType;
  isScrollingRef: RefObject<boolean>;
}) {
  const card = mapMatchToCardProps(match);

  return (
    <MatchCard
      id={card.id}
      home={card.home}
      away={card.away}
      prediction={card.prediction}
      predictionStatus={card.predictionStatus}
      logoVariant="flag"
      date={card.date}
      time={card.time}
      onPress={() => {
        if (isScrollingRef.current) return;
        router.push(`/(app)/(member)/match/${match.id}`);
      }}
    />
  );
}

function StagePage({
  matches,
  width,
  onRefresh,
  isScrollingRef,
}: {
  matches: MatchWithPredictionsType[];
  width: number;
  onRefresh: () => void;
  isScrollingRef: RefObject<boolean>;
}) {
  const { t } = useTranslation();
  const bottomTabsInset = useFloatBottomTabsInset();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} />
      }
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingBottom: bottomTabsInset + 24,
        flexGrow: 1,
      }}
      style={{ width }}
    >
      {matches.length > 0 ? (
        matches.map((match) => (
          <KnockoutMatchCard
            key={match.id}
            match={match}
            isScrollingRef={isScrollingRef}
          />
        ))
      ) : (
        <CText className="text-text mt-6 text-center">
          {t('No matches found')}
        </CText>
      )}
    </ScrollView>
  );
}

export default function KnockoutMatches({
  matches,
  onRefresh,
  selectedStage: controlledSelectedStage,
  onSelectStage,
  showStageTabs = true,
}: KnockoutMatchesProps) {
  const { t } = useTranslation();
  const bottomTabsInset = useFloatBottomTabsInset();
  const isRTL = useIsRTL();
  const flatListRef = useRef<FlatList<string>>(null);
  const isScrollingRef = useRef(false);
  const isProgrammaticScrollRef = useRef(false);
  const lastScrolledIndexRef = useRef(-1);
  const [listReady, setListReady] = useState(false);
  const { width: windowWidth } = useWindowDimensions();
  const pageWidth = Math.min(Math.max(windowWidth - 16, 320), 512);

  const stages = useMemo(() => getKnockoutStages(matches), [matches]);
  const [internalSelectedStage, setInternalSelectedStage] = useState(
    stages[0] ?? '',
  );
  const selectedStage = controlledSelectedStage ?? internalSelectedStage;

  const setSelectedStage = useCallback(
    (stage: string) => {
      if (onSelectStage) onSelectStage(stage);
      else setInternalSelectedStage(stage);
    },
    [onSelectStage],
  );

  useEffect(() => {
    if (!stages.includes(selectedStage)) {
      setSelectedStage(stages[0] ?? '');
    }
  }, [selectedStage, stages, setSelectedStage]);

  useEffect(() => {
    const index = stages.indexOf(selectedStage);
    if (index === -1 || !listReady) return;
    if (lastScrolledIndexRef.current === index) return;

    lastScrolledIndexRef.current = index;
    isProgrammaticScrollRef.current = true;

    requestAnimationFrame(() => {
      flatListRef.current?.scrollToIndex({ index, animated: false });
      requestAnimationFrame(() => {
        isProgrammaticScrollRef.current = false;
      });
    });
  }, [listReady, selectedStage, stages]);

  useEffect(() => {
    lastScrolledIndexRef.current = -1;
  }, [stages]);

  const matchesByStage = useMemo(() => {
    return stages.reduce<Record<string, MatchWithPredictionsType[]>>(
      (acc, stage) => {
        acc[stage] = matches
          .filter((match) => match.stage === stage)
          .sort(
            (a, b) =>
              new Date(a.kick_off).getTime() - new Date(b.kick_off).getTime(),
          );
        return acc;
      },
      {},
    );
  }, [matches, stages]);

  const getItemLayout = useCallback(
    (_: ArrayLike<string> | null | undefined, index: number) => ({
      length: pageWidth,
      offset: pageWidth * index,
      index,
    }),
    [pageWidth],
  );

  const renderStage = useCallback(
    ({ item }: { item: string }) => (
      <StagePage
        matches={matchesByStage[item] ?? []}
        width={pageWidth}
        onRefresh={onRefresh}
        isScrollingRef={isScrollingRef}
      />
    ),
    [matchesByStage, onRefresh, pageWidth],
  );

  if (stages.length === 0) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: bottomTabsInset + 20,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      >
        <CText className="text-text mt-6 text-center">
          {t('No matches found')}
        </CText>
      </ScrollView>
    );
  }

  return (
    <View className="flex-1">
      {showStageTabs && (
        <KnockoutStageTabs
          stages={stages}
          selectedStage={selectedStage}
          onSelectStage={setSelectedStage}
          getLabel={getStageLabel}
        />
      )}

      <FlatList
        ref={flatListRef}
        data={stages}
        keyExtractor={(stage) => stage}
        renderItem={renderStage}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        onLayout={() => setListReady(true)}
        onScrollBeginDrag={() => {
          isScrollingRef.current = true;
        }}
        onMomentumScrollEnd={(event) => {
          isScrollingRef.current = false;
          if (isProgrammaticScrollRef.current) return;

          const index = getStageIndexFromOffset(
            event.nativeEvent.contentOffset.x,
            pageWidth,
            stages.length,
            isRTL,
          );
          const stage = stages[index];
          if (!stage || stage === selectedStage) return;

          lastScrolledIndexRef.current = index;
          setSelectedStage(stage);
        }}
        onScrollToIndexFailed={({ index }) => {
          isProgrammaticScrollRef.current = true;
          requestAnimationFrame(() => {
            flatListRef.current?.scrollToIndex({ index, animated: false });
            lastScrolledIndexRef.current = index;
            requestAnimationFrame(() => {
              isProgrammaticScrollRef.current = false;
            });
          });
        }}
        extraData={matchesByStage}
      />
    </View>
  );
}
