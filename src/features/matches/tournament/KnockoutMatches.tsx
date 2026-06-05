import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsRTL } from '@/providers/LanguageProvider';
import { formatTime } from '@/utils/formats';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, useWindowDimensions, View } from 'react-native';
import { MatchWithPredictionsType } from '../../types';
import { getMatchStatus, isMatchFinished, isMatchLive, isMatchScheduled } from '../../utils/matchStatus';
import { getKnockoutStages, getStageLabel } from '../../utils/tournamentMatches';
import TeamBadge from '../TeamBadge';
import { MatchCardHeader, PredictionDisplay } from '../regular-league/MatchCardDisplay';
import { KnockoutStageTabs } from './TournametTabs';

const getStageIndexFromOffset = (offset: number, pageWidth: number, stageCount: number, isRTL: boolean) => {
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

type TeamSide = 'home' | 'away';
type TeamRow = MatchWithPredictionsType['home_team'] | null | undefined;

const BADGE_SIZE = 26;

const C = {
  cardBg: '#0d1520',
  cardBorder: 'rgba(255,255,255,0.08)',
  headerBg: 'rgba(0,0,0,0.22)',
  divider: 'rgba(255,255,255,0.06)',
  winnerGreen: '#4ade80',
  winnerBg: 'rgba(74,222,128,0.06)',
  ftLabel: 'rgba(255,255,255,0.35)',
  timeLabel: 'rgba(255,255,255,0.5)',
  fixtureLabel: 'rgba(255,255,255,0.2)',
  teamNameColor: '#e2e8f0',
  teamNameLoser: 'rgba(255,255,255,0.32)',
  scoreWinner: '#4ade80',
  scoreLoser: 'rgba(255,255,255,0.18)',
  scoreNeutral: 'rgba(255,255,255,0.8)',
  liveColor: '#4ade80',
  dotActive: '#fb923c',
  dotInactive: 'rgba(255,255,255,0.18)',
} as const;

/* ─── Winner logic ───────────────────────────────────────────── */
function getWinningSide(match: MatchWithPredictionsType): TeamSide | null {
  if (match.score?.winner === 'HOME_TEAM') return 'home';
  if (match.score?.winner === 'AWAY_TEAM') return 'away';
  const status = getMatchStatus(match.status);
  if (!isMatchFinished(status)) return null;
  const h = match.score?.fullTime?.home;
  const a = match.score?.fullTime?.away;
  if (h == null || a == null || h === a) return null;
  return h > a ? 'home' : 'away';
}

/* ─── Match status badge ─────────────────────────────────────── */
function MatchStatusBadge({ match }: { match: MatchWithPredictionsType }) {
  const { t } = useTranslation();
  const status = getMatchStatus(match.status);

  if (isMatchFinished(status)) {
    return (
      <View
        style={{
          borderRadius: 4,
          paddingHorizontal: 6,
          paddingVertical: 2,
          backgroundColor: 'rgba(255,255,255,0.07)',
        }}
      >
        <CText variant="small" bold style={{ color: C.ftLabel, fontSize: 10, letterSpacing: 0.8 }}>
          FT
        </CText>
      </View>
    );
  }

  if (isMatchLive(status)) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.liveColor }} />
        <CText variant="small" bold style={{ color: C.liveColor, fontSize: 10, letterSpacing: 0.8 }}>
          {t('Live')}
        </CText>
      </View>
    );
  }

  if (isMatchScheduled(status)) {
    return (
      <CText variant="small" style={{ color: C.timeLabel, fontSize: 11 }}>
        {formatTime(match.kick_off)}
      </CText>
    );
  }

  return null;
}

/* ─── Single team row inside a card ─────────────────────────── */
function TeamRowItem({
  team,
  score,
  isWinner,
  isLoser,
  showScore,
}: {
  team: TeamRow;
  score: number | null | undefined;
  isWinner: boolean;
  isLoser: boolean;
  showScore: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: isWinner ? C.winnerBg : 'transparent',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Winner accent bar on the left */}
      {isWinner && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            backgroundColor: C.winnerGreen,
            borderTopRightRadius: 2,
            borderBottomRightRadius: 2,
          }}
        />
      )}

      <TeamBadge team={team} size={BADGE_SIZE} />

      <CText
        variant="bodyBold"
        numberOfLines={1}
        style={{
          flex: 1,
          marginLeft: 10,
          fontSize: 13,
          color: isLoser ? C.teamNameLoser : C.teamNameColor,
        }}
      >
        {team?.shortName || '—'}
      </CText>

      {showScore && (
        <CText
          variant="h3"
          bold
          style={{
            minWidth: 20,
            textAlign: 'right',
            fontSize: 19,
            color: isWinner ? C.scoreWinner : isLoser ? C.scoreLoser : C.scoreNeutral,
          }}
        >
          {score ?? '-'}
        </CText>
      )}
    </View>
  );
}

/* ─── Match card ─────────────────────────────────────────────── */
function BracketMatch({
  match,
  isScrollingRef,
}: {
  match: MatchWithPredictionsType;
  isScrollingRef: React.RefObject<boolean>;
}) {
  const winningSide = getWinningSide(match);
  const status = getMatchStatus(match.status);
  const finished = isMatchFinished(status);
  const live = isMatchLive(status);
  const showScore = finished || live;

  const homeScore = match.score?.fullTime?.home ?? null;
  const awayScore = match.score?.fullTime?.away ?? null;
  const homeName = match.home_team?.name ?? '-';
  const awayName = match.away_team?.name ?? '-';
  const prediction = match.predictions?.[0];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${homeName}, ${awayName}`}
      onPress={() => {
        if (isScrollingRef.current) return;
        router.push(`/(app)/(member)/match/${match.id}`);
      }}
      style={{
        backgroundColor: C.cardBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: C.cardBorder,
        overflow: 'hidden',
        marginBottom: 10,
      }}
    >
      <MatchCardHeader
        kickOff={match.kick_off}
        isScheduled={isMatchScheduled(status)}
        isLive={isMatchLive(status)}
        isFinished={isMatchFinished(status)}
      />

      {/* Home team row */}
      <TeamRowItem
        team={match.home_team}
        score={homeScore}
        isWinner={winningSide === 'home'}
        isLoser={finished && winningSide === 'away'}
        showScore={showScore}
      />

      {/* Row divider */}
      <View style={{ height: 1, marginHorizontal: 12, backgroundColor: C.divider }} />

      {/* Away team row */}
      <TeamRowItem
        team={match.away_team}
        score={awayScore}
        isWinner={winningSide === 'away'}
        isLoser={finished && winningSide === 'home'}
        showScore={showScore}
      />

      {prediction && <PredictionDisplay prediction={prediction} isFinished={finished} />}
    </Pressable>
  );
}

/* ─── Stage page (one "page" in the horizontal FlatList) ─────── */
function StagePage({
  stage,
  matches,
  width,
  onRefresh,
  isScrollingRef,
}: {
  stage: string;
  matches: MatchWithPredictionsType[];
  width: number;
  onRefresh: () => void;
  isScrollingRef: React.RefObject<boolean>;
}) {
  const { t } = useTranslation();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
      contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24, flexGrow: 1 }}
      style={{ width }}
    >
      {matches.length > 0 ? (
        matches.map((match) => <BracketMatch key={match.id} match={match} isScrollingRef={isScrollingRef} />)
      ) : (
        <CText className="text-text mt-6 text-center">{t('No matches found')}</CText>
      )}
    </ScrollView>
  );
}

/* ─── Main export ────────────────────────────────────────────── */
export default function KnockoutMatches({
  matches,
  onRefresh,
  selectedStage: controlledSelectedStage,
  onSelectStage,
  showStageTabs = true,
}: KnockoutMatchesProps) {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const flatListRef = useRef<FlatList<string>>(null);
  const isScrollingRef = useRef(false);
  const isProgrammaticScrollRef = useRef(false);
  const lastScrolledIndexRef = useRef(-1);
  const [listReady, setListReady] = useState(false);
  const { width: windowWidth } = useWindowDimensions();
  const pageWidth = Math.min(Math.max(windowWidth - 16, 320), 512);

  const stages = useMemo(() => getKnockoutStages(matches), [matches]);
  const [internalSelectedStage, setInternalSelectedStage] = useState(stages[0] ?? '');
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
    return stages.reduce<Record<string, MatchWithPredictionsType[]>>((acc, stage) => {
      acc[stage] = matches
        .filter((m) => m.stage === stage)
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
    ({ item }: { item: string }) => (
      <StagePage
        stage={item}
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
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
      >
        <CText className="text-text mt-6 text-center">{t('No matches found')}</CText>
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

          const index = getStageIndexFromOffset(event.nativeEvent.contentOffset.x, pageWidth, stages.length, isRTL);
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
