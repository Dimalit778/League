import { MyImage, Text } from '@/components/ui';
import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { StatusType } from '../types';
import { PredictionDisplayStatus } from '../utils/matchCard.mapper';
import { getMatchStatus } from '../utils/matchStatus';
import { MATCH_CARD_LAYOUT, MATCH_CARD_VIEWBOX_HEIGHT, MatchCardBg } from './MatchCardBg';

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
  time: string;
  onPress?: () => void;
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
    <View style={{ width }} className="items-center gap-1.5 ">
      <View style={{ width: logoWidth, height: logoHeight }} className="items-center justify-center overflow-hidden">
        <MyImage
          source={logo}
          width={logoWidth}
          height={logoHeight}
          contentFit={logoContentFit}
          cachePolicy="memory-disk"
          transition={0}
        />
      </View>

      <View className="mt-0.5 h-6 w-[95%] justify-start items-center">
        <Text semibold numberOfLines={2} ellipsizeMode="tail">
          {name}
        </Text>
      </View>
    </View>
  );
}

const LIVE_GOLD = '#F59E0B';

const MatchHeader = ({
  status,
  date,
  time,
  top,
}: {
  status?: StatusType | null;
  date: string;
  time: string;
  top: number;
}) => {
  const displayStatus = getMatchStatus(status);

  if (displayStatus === 'FINISHED') {
    return (
      <View className="absolute left-0 right-0 z-10 items-center" style={{ top }}>
        <Text className="text-[10px] font-semibold text-muted" numberOfLines={1}>
          FT
        </Text>
      </View>
    );
  }

  if (displayStatus === 'LIVE') {
    return (
      <View className="absolute left-0 right-0 z-10 items-center" style={{ top }}>
        <Text className="text-[10px] font-bold" style={{ color: LIVE_GOLD }} numberOfLines={1}>
          LIVE
        </Text>
      </View>
    );
  }

  return (
    <View className="absolute left-0 right-0 z-10 items-center" style={{ top }}>
      <View className="max-w-[85%] flex-row items-center justify-center gap-2">
        <Text className="max-w-[45%] text-[10px] font-medium text-muted" numberOfLines={1} ellipsizeMode="tail">
          {date}
        </Text>
        <View className="h-3 w-0.5 bg-border" />
        <Text className="max-w-[45%] text-[10px] font-medium text-muted" numberOfLines={1} ellipsizeMode="tail">
          {time}
        </Text>
      </View>
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
}: MatchCardProps) {
  const { width: screenWidth } = useWindowDimensions();

  const cardWidth = screenWidth - 30;
  const cardHeight = Math.round(cardWidth * (MATCH_CARD_VIEWBOX_HEIGHT / 360) * 0.9);

  const gap = 8;
  const centerWidth = 72;

  const teamWidth = (cardWidth - gap * 2 - centerWidth) / 2;
  const contentHeight = cardHeight * (MATCH_CARD_LAYOUT.contentBottomY - MATCH_CARD_LAYOUT.contentTopY);
  const logoBoxSize = Math.min(teamWidth * 0.9, Math.round(cardHeight * 0.5), 40);
  const logoWidth = logoBoxSize;
  const logoHeight = logoVariant === 'flag' ? Math.round((logoWidth * 2) / 3) : logoBoxSize;
  const logoContentFit = logoVariant === 'flag' ? 'cover' : 'contain';

  const hasScore = home.score !== null && home.score !== undefined && away.score !== null && away.score !== undefined;

  const isFinished = status === 'FINISHED';

  const hasPrediction =
    prediction?.home !== null &&
    prediction?.home !== undefined &&
    prediction?.away !== null &&
    prediction?.away !== undefined;

  const scoreText = hasScore ? `${home.score} - ${away.score}` : 'VS';
  const predictionText = hasPrediction ? `${prediction?.home} - ${prediction?.away}` : '- -';

  const accessibilityLabel = `${home.name}, ${scoreText}, ${away.name}`;

  const predictionTextClass =
    predictionStatus === 'correct' ? 'text-success' : predictionStatus === 'incorrect' ? 'text-error' : 'text-muted';

  const headerTop = cardHeight * MATCH_CARD_LAYOUT.dateTabCenterY - 12;
  const predictionTop = cardHeight * MATCH_CARD_LAYOUT.predictionTabCenterY - 10;
  const mainContentTop = cardHeight * MATCH_CARD_LAYOUT.contentTopY;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress ?? (() => router.push(`/(app)/(league)/match/${id}`))}
      className={`mb-2 w-full items-center ${isFinished ? 'opacity-60' : ''}`}
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

        <MatchHeader status={status} date={date} time={time} top={headerTop} />

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
            <Text
              className="text-2xl font-semibold text-text"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {scoreText}
            </Text>
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

        <View className="absolute left-0 right-0 z-10 items-center" style={{ top: predictionTop }}>
          <Text className={`text-base font-semibold ${predictionTextClass}`} numberOfLines={1}>
            {predictionText}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});
