import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativeWind';
import { formatTime } from '@/utils/formats';
import { Image as ExpoImage } from 'expo-image';
import { Link } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  useWindowDimensions,
  View,
  ViewToken,
} from 'react-native';
import { MatchWithPredictionsType } from '../../types';
import { getMatchStatus, isMatchFinished, isMatchLive, isMatchScheduled } from '../../utils/matchStatus';
import { getKnockoutStages, getStageLabel } from '../../utils/tournamentMatches';
import TeamBadge from '../TeamBadge';

type KnockoutMatchesProps = {
  matches: MatchWithPredictionsType[];
  onRefresh: () => void;
};

type StageTabsProps = {
  stages: string[];
  selected: string;
  onSelect: (stage: string) => void;
};

type TeamSide = 'home' | 'away';
type TeamRow = MatchWithPredictionsType['home_team'] | null | undefined;

const TEAM_LOGO_SIZE = 34;
const CONNECTOR_COLOR = 'rgba(255,255,255,0.22)';
const CARD = {
  bg: '#161b22',
  teamBg: '#20262d',
  winnerBg: 'rgba(16, 185, 129, 0.12)',
  winnerBorder: 'rgba(16, 185, 129, 0.55)',
  border: 'rgba(255,255,255,0.08)',
} as const;

const StageTabs = ({ stages, selected, onSelect }: StageTabsProps) => {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
    >
      {stages.map((stage) => {
        const active = selected === stage;
        return (
          <Pressable
            key={stage}
            onPress={() => onSelect(stage)}
            className={cn(
              'mx-1 min-w-[96px] items-center justify-center rounded-lg px-4 py-1.5',
              active ? 'bg-primary' : 'border border-border',
            )}
          >
            <CText variant="bodyBold" className={active ? 'text-background' : 'text-text'}>
              {t(getStageLabel(stage))}
            </CText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

function TeamCrest({ team }: { team: TeamRow }) {
  if (!team) {
    return <View className="rounded-full bg-white/10" style={{ width: TEAM_LOGO_SIZE, height: TEAM_LOGO_SIZE }} />;
  }

  const logo = team.logo?.trim();
  if (logo?.length) {
    return (
      <ExpoImage
        source={logo}
        style={{ width: TEAM_LOGO_SIZE, height: TEAM_LOGO_SIZE, borderRadius: TEAM_LOGO_SIZE / 2 }}
        cachePolicy="memory-disk"
        contentFit="contain"
      />
    );
  }

  return (
    <View className="overflow-hidden rounded-full" style={{ width: TEAM_LOGO_SIZE, height: TEAM_LOGO_SIZE }}>
      <TeamBadge teamId={team.id} name={team.name} shortName={team.shortName} tla={team.tla} size={TEAM_LOGO_SIZE} />
    </View>
  );
}

function getWinningSide(match: MatchWithPredictionsType): TeamSide | null {
  if (match.score?.winner === 'HOME_TEAM') return 'home';
  if (match.score?.winner === 'AWAY_TEAM') return 'away';

  const matchStatus = getMatchStatus(match.status);
  if (!isMatchFinished(matchStatus)) return null;

  const homeScore = match.score?.fullTime?.home;
  const awayScore = match.score?.fullTime?.away;
  if (homeScore == null || awayScore == null || homeScore === awayScore) return null;
  return homeScore > awayScore ? 'home' : 'away';
}

function TeamSlot({ team, winner }: { team: TeamRow; winner: boolean }) {
  return (
    <View
      className="h-[74px] flex-1 items-center justify-center rounded-lg border px-2"
      style={{
        backgroundColor: winner ? CARD.winnerBg : CARD.teamBg,
        borderColor: winner ? CARD.winnerBorder : CARD.border,
      }}
    >
      <TeamCrest team={team} />
      <CText variant="small" bold numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78} className="mt-1 text-center">
        {team?.name ?? '—'}
      </CText>
    </View>
  );
}

function KnockoutScore({ match }: { match: MatchWithPredictionsType }) {
  const { t } = useTranslation();
  const matchStatus = getMatchStatus(match.status);
  const homeScore = match.score?.fullTime?.home;
  const awayScore = match.score?.fullTime?.away;

  if (isMatchFinished(matchStatus)) {
    return (
      <CText variant="bodyBold" className="text-white">
        {homeScore != null && awayScore != null ? `${homeScore} : ${awayScore}` : '-'}
      </CText>
    );
  }

  if (isMatchLive(matchStatus)) {
    return (
      <>
        <CText variant="small" bold className="text-emerald-400">
          {t('Live')}
        </CText>
        <CText variant="bodyBold" className="text-white">
          {`${homeScore ?? 0} : ${awayScore ?? 0}`}
        </CText>
      </>
    );
  }

  if (isMatchScheduled(matchStatus)) {
    return (
      <CText variant="bodyBold" className="text-white">
        {formatTime(match.kick_off)}
      </CText>
    );
  }

  return (
    <CText variant="bodyBold" className="text-white/80">
      -
    </CText>
  );
}

function BracketMatch({ match }: { match: MatchWithPredictionsType }) {
  const winningSide = getWinningSide(match);
  const homeName = match.home_team?.name ?? '-';
  const awayName = match.away_team?.name ?? '-';

  return (
    <Link href={`/(app)/(member)/match/${match.id}`} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${homeName}, ${awayName}`}
        className="rounded-xl border px-2 py-2"
        style={{ backgroundColor: CARD.bg, borderColor: CARD.border }}
      >
        <View className="mb-1 flex-row items-center justify-between px-1">
          <CText variant="small" bold className="text-white/70">
            {match.fixture ? `#${match.fixture}` : ' '}
          </CText>
          {winningSide ? <View className="h-2 w-2 rounded-full bg-emerald-400" /> : null}
        </View>

        <View className="flex-row items-center gap-2">
          <TeamSlot team={match.home_team} winner={winningSide === 'home'} />
          <View className="min-w-[54px] items-center justify-center rounded-lg px-1 py-2" style={{ backgroundColor: '#0f141a' }}>
            <KnockoutScore match={match} />
          </View>
          <TeamSlot team={match.away_team} winner={winningSide === 'away'} />
        </View>
      </Pressable>
    </Link>
  );
}

function PairConnector() {
  return (
    <View pointerEvents="none" className="absolute bottom-11 right-0 top-11 w-8">
      <View className="absolute right-0 top-0 h-px w-8" style={{ backgroundColor: CONNECTOR_COLOR }} />
      <View className="absolute bottom-0 right-0 h-px w-8" style={{ backgroundColor: CONNECTOR_COLOR }} />
      <View className="absolute bottom-0 right-0 top-0 w-px" style={{ backgroundColor: CONNECTOR_COLOR }} />
      <View className="absolute right-[-14px] top-1/2 h-px w-[14px]" style={{ backgroundColor: CONNECTOR_COLOR }} />
    </View>
  );
}

function StagePage({
  stage,
  matches,
  isLastStage,
  width,
  onRefresh,
}: {
  stage: string;
  matches: MatchWithPredictionsType[];
  isLastStage: boolean;
  width: number;
  onRefresh: () => void;
}) {
  const { t } = useTranslation();
  const pairs = useMemo(() => {
    const grouped: MatchWithPredictionsType[][] = [];
    for (let index = 0; index < matches.length; index += 2) {
      grouped.push(matches.slice(index, index + 2));
    }
    return grouped;
  }, [matches]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
      contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24, flexGrow: 1 }}
      style={{ width }}
    >
      <View className="mb-3 mt-1 flex-row items-center justify-between">
        <CText variant="h3" bold className="text-text">
          {t(getStageLabel(stage))}
        </CText>
        <CText variant="small" className="text-muted">
          {matches.length} {t('Matches')}
        </CText>
      </View>

      {pairs.length > 0 ? (
        pairs.map((pair, pairIndex) => (
          <View key={`${stage}-${pairIndex}`} className="relative mb-5 pr-5">
            <View className="gap-3">
              {pair.map((match) => (
                <BracketMatch key={match.id} match={match} />
              ))}
            </View>
            {!isLastStage && pair.length === 2 ? <PairConnector /> : null}
          </View>
        ))
      ) : (
        <CText className="text-text mt-6 text-center">{t('No matches found')}</CText>
      )}
    </ScrollView>
  );
}

export default function KnockoutMatches({ matches, onRefresh }: KnockoutMatchesProps) {
  const { t } = useTranslation();
  const flatListRef = useRef<FlatList<string>>(null);
  const [listReady, setListReady] = useState(false);
  const { width: windowWidth } = useWindowDimensions();
  const pageWidth = Math.min(Math.max(windowWidth - 16, 320), 512);
  const stages = useMemo(() => getKnockoutStages(matches), [matches]);
  const [selectedStage, setSelectedStage] = useState(stages[0] ?? '');

  useEffect(() => {
    setSelectedStage((prev) => (stages.includes(prev) ? prev : (stages[0] ?? '')));
  }, [stages]);

  const selectedStageIndex = Math.max(
    0,
    stages.findIndex((stage) => stage === selectedStage),
  );
  const lastStage = stages[stages.length - 1];

  const matchesByStage = useMemo(() => {
    return stages.reduce<Record<string, MatchWithPredictionsType[]>>((acc, stage) => {
      acc[stage] = matches
        .filter((match) => match.stage === stage)
        .sort((a, b) => new Date(a.kick_off).getTime() - new Date(b.kick_off).getTime());
      return acc;
    }, {});
  }, [matches, stages]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const handleViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken<string>[] }) => {
    const nextStage = viewableItems[0]?.item;
    if (nextStage) {
      setSelectedStage(nextStage);
    }
  }).current;

  const handleSelectStage = useCallback(
    (stage: string) => {
      setSelectedStage(stage);
      const index = stages.indexOf(stage);
      if (index !== -1 && listReady) {
        requestAnimationFrame(() => {
          flatListRef.current?.scrollToIndex({ index, animated: true });
        });
      }
    },
    [listReady, stages],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<string> | null | undefined, index: number) => ({
      length: pageWidth,
      offset: pageWidth * index,
      index,
    }),
    [pageWidth],
  );

  const renderStage = useCallback(
    ({ item }: { item: string; index: number }) => (
      <StagePage
        stage={item}
        matches={matchesByStage[item] ?? []}
        isLastStage={item === lastStage}
        width={pageWidth}
        onRefresh={onRefresh}
      />
    ),
    [lastStage, matchesByStage, onRefresh, pageWidth],
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
      <StageTabs stages={stages} selected={selectedStage} onSelect={handleSelectStage} />
      <View className="mb-2 flex-row items-center justify-center gap-2">
        {stages.map((stage, index) => (
          <View
            key={stage}
            className={cn('h-2 rounded-full', index === selectedStageIndex ? 'w-6 bg-primary' : 'w-2 bg-muted/60')}
          />
        ))}
      </View>
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
        onScrollToIndexFailed={({ index }) => {
          requestAnimationFrame(() => {
            flatListRef.current?.scrollToIndex({ index, animated: true });
          });
        }}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        extraData={matchesByStage}
      />
    </View>
  );
}
