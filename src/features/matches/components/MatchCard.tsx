import { MyImage, Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { router } from 'expo-router';
import { CirclePlus, Clock } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { StatusType } from '../types';
import { PredictionDisplayStatus } from '../utils/matchCard.mapper';
import { getMatchStatus } from '../utils/matchStatus';
import { getMatchCardMetrics, MatchCardBg } from './MatchCardBg';

type Team = {
  name: string;
  logo: string;
  score?: number | null;
};

type MatchCardProps = {
  id: string | number;
  home: Team;
  away: Team;
  prediction?: {
    home?: number | null;
    away?: number | null;
  } | null;
  predictionStatus?: PredictionDisplayStatus;
  logoVariant?: 'team' | 'flag';
  status?: StatusType | null;
  date: string;
  time?: string;
  onPress?: () => void;
  /** When set, card metrics use this width instead of the window width. */
  layoutWidth?: number;
};

type TeamBlockProps = {
  name: string;
  logo: string;
  width: number;
  logoWidth: number;
  logoHeight: number;
  logoContentFit: 'contain' | 'cover';
};

function TeamBlock({ name, logo, width, logoWidth, logoHeight, logoContentFit }: TeamBlockProps) {
  return (
    <View style={{ width }} className="items-center  gap-1 mt-2 ">
      <View style={{ width: logoWidth, height: logoHeight }} className="items-center justify-center overflow-hidden">
        <MyImage
          source={logo}
          width={logoWidth}
          height={logoHeight}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={0}
        />
      </View>

      <View className="mt-0.5 h-6 w-[95%] justify-start items-center">
        <Text variant="bodySmall" numberOfLines={2} ellipsizeMode="tail">
          {name}
        </Text>
      </View>
    </View>
  );
}
const PredictionBlock = ({
  prediction,
  predictionStatus,
  top,
  height,
  matchStatus,
}: {
  prediction?: { home?: number | null; away?: number | null } | null;
  predictionStatus: PredictionDisplayStatus;
  top: number;
  height: number;
  matchStatus?: StatusType | null;
}) => {
  const { colors } = useThemeTokens();
  const hasPrediction =
    prediction?.home !== null &&
    prediction?.home !== undefined &&
    prediction?.away !== null &&
    prediction?.away !== undefined;

  const finishedAndNoPrediction = matchStatus === 'FINISHED' && !hasPrediction;

  if (finishedAndNoPrediction) {
    return (
      <View className="absolute left-0 right-0 z-10 items-center justify-center" style={{ top, height }}>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          No Prediction
        </Text>
      </View>
    );
  }
  const predictionTextClass =
    predictionStatus === 'correct' ? 'text-success' : predictionStatus === 'incorrect' ? 'text-error' : 'text-info';

  return (
    <View className="absolute left-0 right-0 z-10 items-center justify-center" style={{ top, height }}>
      {hasPrediction ? (
        <Text className={`${predictionTextClass} font-semibold leading-5`} numberOfLines={1}>
          {`${prediction.home} - ${prediction.away}`}
        </Text>
      ) : (
        <CirclePlus size={20} color={colors.info} strokeWidth={1.8} />
      )}
    </View>
  );
};
const ScoreBlock = ({ score, time, hasScore }: { score: string; time?: string; hasScore: boolean }) => {
  const { colors } = useThemeTokens();

  if (hasScore) {
    return (
      <Text variant="title" className="w-full text-center text-text" numberOfLines={1}>
        {score}
      </Text>
    );
  }

  return (
    <View className="flex-row items-center justify-center gap-1.5">
      <Clock size={13} color={colors.muted} />
      <Text variant="bodySmall" tone="muted" numberOfLines={1}>
        {time}
      </Text>
    </View>
  );
};

const MatchHeader = ({ status, date, top }: { status?: StatusType | null; date: string; top: number }) => {
  const displayStatus = getMatchStatus(status);

  if (displayStatus === 'FINISHED') {
    return (
      <View className="absolute left-0 right-0 z-10 items-center" style={{ top }}>
        <Text variant="bodySmall" numberOfLines={1}>
          FT
        </Text>
      </View>
    );
  }

  if (displayStatus === 'LIVE') {
    return (
      <View className="absolute left-0 right-0 z-10 items-center" style={{ top }}>
        <Text variant="bodySmall" tone="success" numberOfLines={1}>
          LIVE
        </Text>
      </View>
    );
  }

  return (
    <View className="absolute left-0 right-0 z-10 items-center" style={{ top }}>
      <Text variant="caption" tone="muted">
        {date}
      </Text>
    </View>
  );
};

export const MatchCard = memo(function MatchCard({
  id,
  home,
  away,
  prediction,
  predictionStatus = 'none',
  logoVariant = 'team',
  status,
  date,
  time,
  onPress,
  layoutWidth,
}: MatchCardProps) {
  const { width: screenWidth } = useWindowDimensions();

  const {
    width: cardWidth,
    height: cardHeight,
    gap,
    centerWidth,
    teamWidth,
    contentHeight,
    contentTop: mainContentTop,
    headerTop,
    predictionTop,
    predictionHeight,
    logoBoxSize,
  } = getMatchCardMetrics(layoutWidth ?? screenWidth);

  const logoWidth = logoBoxSize;
  const logoHeight = logoVariant === 'flag' ? Math.round((logoWidth * 2) / 3) : logoBoxSize;
  const logoContentFit = logoVariant === 'flag' ? 'cover' : 'contain';

  const hasScore = home.score !== null && home.score !== undefined && away.score !== null && away.score !== undefined;

  const scoreLabel = hasScore ? `${home.score} - ${away.score}` : (time ?? '');

  const accessibilityLabel = `${home.name}, ${scoreLabel}, ${away.name}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress ?? (() => router.push(`/(app)/(league)/match/${id}`))}
      className="w-full items-center"
    >
      <View
        style={{
          width: cardWidth,
          height: cardHeight,
        }}
      >
        <View className="absolute inset-0">
          <MatchCardBg width={cardWidth} height={cardHeight} predictionStatus={predictionStatus} />
        </View>

        <MatchHeader status={status} date={date} top={headerTop} />

        <View
          className="absolute left-0 right-0 flex-row items-center justify-center"
          style={{
            top: mainContentTop,
            height: contentHeight,
            gap,
          }}
        >
          <TeamBlock
            name={home.name}
            logo={home.logo}
            width={teamWidth}
            logoWidth={logoWidth}
            logoHeight={logoHeight}
            logoContentFit={logoContentFit}
          />

          <View style={{ width: centerWidth }} className="items-center justify-center">
            <ScoreBlock score={scoreLabel} time={time} hasScore={hasScore} />
          </View>

          <TeamBlock
            name={away.name}
            logo={away.logo}
            width={teamWidth}
            logoWidth={logoWidth}
            logoHeight={logoHeight}
            logoContentFit={logoContentFit}
          />
        </View>

        <PredictionBlock
          prediction={prediction}
          predictionStatus={predictionStatus}
          top={predictionTop}
          height={predictionHeight}
          matchStatus={status}
        />
      </View>
    </Pressable>
  );
});
