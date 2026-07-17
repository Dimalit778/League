import { useFloatBottomTabsInset } from '@/components/layout';
import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsRTL } from '@/providers/LanguageProvider';
import { router } from 'expo-router';
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { FlatList, LayoutChangeEvent, RefreshControl, ScrollView, View } from 'react-native';
import { MatchWithPredictionsType } from '../../types';
import { mapMatchToCardData } from '../../utils/matchCard.mapper';
import { getKnockoutStages, getStageLabel, FINAL_DISPLAY_STAGE, isFinalMatchStage, isThirdPlaceStage } from '../../utils/tournamentMatches';
import { MatchCard } from '../MatchCard';
import { BracketConnector } from './BracketConnector';
import { KnockoutStageTabs } from './TournametTabs';

const getStageIndexFromOffset = (offset: number, pageWidth: number, stageCount: number, isRTL: boolean) => {
  if (pageWidth <= 0) return 0;
  const pageIndex = Math.round(offset / pageWidth);
  if (!isRTL) return Math.max(0, Math.min(stageCount - 1, pageIndex));
  return Math.max(0, Math.min(stageCount - 1, stageCount - pageIndex - 1));
};

const chunkMatches = (matches: MatchWithPredictionsType[]) => {
  const pairs: MatchWithPredictionsType[][] = [];
  for (let i = 0; i < matches.length; i += 2) {
    pairs.push(matches.slice(i, i + 2));
  }
  return pairs;
};

type KnockoutMatchesProps = {
  matches: MatchWithPredictionsType[];
  onRefresh: () => void;
  selectedStage?: string;
  onSelectStage?: (stage: string) => void;
  showStageTabs?: boolean;
  initialStage?: string;
};

function KnockoutMatchCard({
  match,
  isScrollingRef,
}: {
  match: MatchWithPredictionsType;
  isScrollingRef: RefObject<boolean>;
}) {
  const card = mapMatchToCardData(match);

  return (
    <MatchCard
      id={card.id}
      home={card.home}
      away={card.away}
      prediction={card.prediction}
      predictionStatus={card.predictionStatus}
      status={card.status}
      logoVariant="flag"
      date={card.date}
      time={card.time}
      onPress={() => {
        if (isScrollingRef.current) return;
        router.push(`/(app)/(league)/match/${match.id}`);
      }}
    />
  );
}

function MatchPairBlock({
  pair,
  showConnector,
  isRTL,
  isScrollingRef,
}: {
  pair: MatchWithPredictionsType[];
  showConnector: boolean;
  isRTL: boolean;
  isScrollingRef: RefObject<boolean>;
}) {
  const [pairHeight, setPairHeight] = useState(0);
  const [topCenterY, setTopCenterY] = useState<number | null>(null);
  const [bottomCenterY, setBottomCenterY] = useState<number | null>(null);

  const onPairLayout = (event: LayoutChangeEvent) => {
    setPairHeight(event.nativeEvent.layout.height);
  };

  const onTopCardLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    setTopCenterY(y + height / 2);
  };

  const onBottomCardLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    setBottomCenterY(y + height / 2);
  };

  if (pair.length === 1) {
    return <KnockoutMatchCard match={pair[0]} isScrollingRef={isScrollingRef} />;
  }

  const canDrawConnector = showConnector && topCenterY != null && bottomCenterY != null && pairHeight > 0;

  return (
    <View
      className="mb-2 flex-row items-stretch"
      style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
      onLayout={onPairLayout}
    >
      <View className="min-w-0 flex-1">
        <View onLayout={onTopCardLayout}>
          <KnockoutMatchCard match={pair[0]} isScrollingRef={isScrollingRef} />
        </View>
        <View onLayout={onBottomCardLayout}>
          <KnockoutMatchCard match={pair[1]} isScrollingRef={isScrollingRef} />
        </View>
      </View>

      {showConnector &&
        (canDrawConnector ? (
          <BracketConnector
            height={pairHeight}
            topCenterY={topCenterY}
            bottomCenterY={bottomCenterY}
            isRTL={isRTL}
          />
        ) : (
          <View style={{ width: 28 }} />
        ))}
    </View>
  );
}

function FinalStageSection({
  title,
  subtitle,
  emphasized,
  children,
}: {
  title: string;
  subtitle?: string;
  emphasized?: boolean;
  children: ReactNode;
}) {
  return (
    <View
      className={
        emphasized
          ? 'rounded-2xl border-2 border-primary/35 bg-surface px-2 pb-2 pt-4'
          : 'rounded-2xl border border-border bg-surfaceSecondary/60 px-2 pb-2 pt-4'
      }
    >
      <View className="mb-3 px-1">
        <Text variant={emphasized ? 'h3' : 'body'} semibold className="text-text">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" className="text-muted mt-1">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function StagePage({
  stageKey,
  matches,
  width,
  onRefresh,
  isScrollingRef,
  showConnectors,
  isRTL,
}: {
  stageKey: string;
  matches: MatchWithPredictionsType[];
  width: number;
  onRefresh: () => void;
  isScrollingRef: RefObject<boolean>;
  showConnectors: boolean;
  isRTL: boolean;
}) {
  const { t } = useTranslation();
  const bottomTabsInset = useFloatBottomTabsInset();
  const isFinalPage = stageKey === FINAL_DISPLAY_STAGE;

  const finalMatches = useMemo(
    () =>
      isFinalPage
        ? matches
            .filter((match) => isFinalMatchStage(match.stage))
            .sort((a, b) => new Date(a.kick_off).getTime() - new Date(b.kick_off).getTime())
        : [],
    [isFinalPage, matches],
  );

  const thirdPlaceMatches = useMemo(
    () =>
      isFinalPage
        ? matches
            .filter((match) => isThirdPlaceStage(match.stage))
            .sort((a, b) => new Date(a.kick_off).getTime() - new Date(b.kick_off).getTime())
        : [],
    [isFinalPage, matches],
  );

  const pairs = useMemo(() => chunkMatches(matches), [matches]);
  const hasContent = isFinalPage ? finalMatches.length > 0 || thirdPlaceMatches.length > 0 : matches.length > 0;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
      contentContainerStyle={{
        paddingStart: 12,
        paddingEnd: showConnectors ? 4 : 12,
        paddingBottom: bottomTabsInset + 24,
        flexGrow: 1,
      }}
      style={{ width }}
    >
      {hasContent ? (
        isFinalPage ? (
          <View className="gap-5">
            {finalMatches.length > 0 && (
              <FinalStageSection
                title={t('Final')}
                subtitle={t('The championship final')}
                emphasized
              >
                {finalMatches.map((match) => (
                  <KnockoutMatchCard key={match.id} match={match} isScrollingRef={isScrollingRef} />
                ))}
              </FinalStageSection>
            )}

            {thirdPlaceMatches.length > 0 && (
              <FinalStageSection
                title={t('Third-Fourth')}
                subtitle={t('Third place playoff')}
              >
                {thirdPlaceMatches.map((match) => (
                  <KnockoutMatchCard key={match.id} match={match} isScrollingRef={isScrollingRef} />
                ))}
              </FinalStageSection>
            )}
          </View>
        ) : (
          pairs.map((pair) => (
            <MatchPairBlock
              key={pair.map((match) => match.id).join('-')}
              pair={pair}
              showConnector={showConnectors}
              isRTL={isRTL}
              isScrollingRef={isScrollingRef}
            />
          ))
        )
      ) : (
        <Text className="text-text mt-6 text-center">{t('No matches found')}</Text>
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
  initialStage,
}: KnockoutMatchesProps) {
  const { t } = useTranslation();
  const bottomTabsInset = useFloatBottomTabsInset();
  const isRTL = useIsRTL();
  const flatListRef = useRef<FlatList<string>>(null);
  const isScrollingRef = useRef(false);
  const isProgrammaticScrollRef = useRef(false);
  const lastScrolledIndexRef = useRef(-1);
  const [pageWidth, setPageWidth] = useState(0);
  const listReady = pageWidth > 0;

  const stages = useMemo(() => getKnockoutStages(matches), [matches]);
  const [internalSelectedStage, setInternalSelectedStage] = useState('');
  const selectedStage = controlledSelectedStage ?? internalSelectedStage;

  const setSelectedStage = useCallback(
    (stage: string) => {
      if (onSelectStage) onSelectStage(stage);
      else setInternalSelectedStage(stage);
    },
    [onSelectStage],
  );

  useEffect(() => {
    if (controlledSelectedStage != null) return;
    if (stages.length === 0) return;

    setInternalSelectedStage((current) => {
      if (current && stages.includes(current)) return current;
      if (initialStage && stages.includes(initialStage)) return initialStage;
      return stages[0] ?? '';
    });
  }, [controlledSelectedStage, initialStage, stages]);

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
    return stages.reduce<Record<string, MatchWithPredictionsType[]>>((acc, stage) => {
      if (stage === FINAL_DISPLAY_STAGE) {
        acc[stage] = matches
          .filter((match) => isFinalMatchStage(match.stage) || isThirdPlaceStage(match.stage))
          .sort((a, b) => new Date(a.kick_off).getTime() - new Date(b.kick_off).getTime());
        return acc;
      }

      acc[stage] = matches
        .filter((match) => match.stage === stage)
        .sort((a, b) => new Date(a.kick_off).getTime() - new Date(b.kick_off).getTime());
      return acc;
    }, {});
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
    ({ item, index }: { item: string; index: number }) => (
      <View style={{ width: pageWidth }}>
        <StagePage
          stageKey={item}
          matches={matchesByStage[item] ?? []}
          width={pageWidth}
          onRefresh={onRefresh}
          isScrollingRef={isScrollingRef}
          showConnectors={index < stages.length - 1}
          isRTL={isRTL}
        />
      </View>
    ),
    [isRTL, matchesByStage, onRefresh, pageWidth, stages.length],
  );

  if (stages.length === 0) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: bottomTabsInset + 20,
          flexGrow: 1,
        }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
      >
        <Text className="text-text mt-6 text-center">{t('No matches found')}</Text>
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

      <View
        className="flex-1"
        onLayout={(e) => {
          const nextWidth = e.nativeEvent.layout.width;
          if (nextWidth > 0 && nextWidth !== pageWidth) {
            lastScrolledIndexRef.current = -1;
            setPageWidth(nextWidth);
          }
        }}
      >
        {listReady && (
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
            style={{ flex: 1 }}
            windowSize={2}
          />
        )}
      </View>
    </View>
  );
}
