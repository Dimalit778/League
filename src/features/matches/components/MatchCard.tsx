import { MyImage } from '@/components/ui/MyImage';
import { selectLeagueId, useMemberStore } from '@/store/MemberStore';
import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { CText } from '../../../components/ui/CText';
import { PredictionDisplayStatus } from '../utils/matchCard.mapper';
import {
  MATCH_CARD_LAYOUT,
  MATCH_CARD_VIEWBOX_HEIGHT,
  MatchCardBg,
} from './MatchCardBg';

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

function TeamBlock({
  name,
  logo,
  width,
  logoWidth,
  logoHeight,
  logoContentFit,
}: TeamBlockProps) {
  return (
    <View style={{ width }} className="items-center px-1">
      <View
        style={{ width: logoWidth, height: logoHeight }}
        className="items-center justify-center overflow-hidden"
      >
        <MyImage
          source={logo}
          width={logoWidth}
          height={logoHeight}
          contentFit={logoContentFit}
          cachePolicy="memory-disk"
          transition={0}
        />
      </View>

      <View className="mt-0.5 h-6 w-[95%] justify-start">
        <CText
          className="text-center text-[10px] font-bold leading-tight text-text"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {name}
        </CText>
      </View>
    </View>
  );
}

export const MatchCard = memo(function MatchCard({
  id,
  home,
  away,
  prediction,
  predictionStatus = 'none',
  logoVariant = 'team',
  date,
  time,
  onPress,
}: MatchCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const leagueId = useMemberStore(selectLeagueId);

  const cardWidth = screenWidth - 16;
  const cardHeight = Math.round(cardWidth * (MATCH_CARD_VIEWBOX_HEIGHT / 360));

  const horizontalPadding = 16;
  const gap = 8;
  const centerWidth = 72;

  const teamWidth =
    (cardWidth - horizontalPadding * 2 - gap * 2 - centerWidth) / 2;
  const contentHeight =
    cardHeight *
    (MATCH_CARD_LAYOUT.contentBottomY - MATCH_CARD_LAYOUT.contentTopY);
  const logoBoxSize = Math.min(
    teamWidth * 0.9,
    Math.round(cardHeight * 0.44),
    58,
  );
  const logoWidth = logoBoxSize;
  const logoHeight =
    logoVariant === 'flag' ? Math.round((logoWidth * 2) / 3) : logoBoxSize;
  const logoContentFit = logoVariant === 'flag' ? 'cover' : 'contain';

  const hasScore =
    home.score !== null &&
    home.score !== undefined &&
    away.score !== null &&
    away.score !== undefined;

  const hasPrediction =
    prediction?.home !== null &&
    prediction?.home !== undefined &&
    prediction?.away !== null &&
    prediction?.away !== undefined;

  const scoreText = hasScore ? `${home.score} - ${away.score}` : 'VS';
  const predictionText = hasPrediction
    ? `${prediction?.home} - ${prediction?.away}`
    : '- -';

  const accessibilityLabel = `${home.name}, ${scoreText}, ${away.name}`;

  const predictionTextClass =
    predictionStatus === 'correct'
      ? 'text-success'
      : predictionStatus === 'incorrect'
        ? 'text-error'
        : 'text-muted';

  const dateTop = cardHeight * MATCH_CARD_LAYOUT.dateTabCenterY - 12;
  const predictionTop =
    cardHeight * MATCH_CARD_LAYOUT.predictionTabCenterY - 10;
  const mainContentTop = cardHeight * MATCH_CARD_LAYOUT.contentTopY;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress ?? (() => router.push(`/(app)/league/${leagueId}/match/${id}`))}
      className="mb-2 w-full items-center"
    >
      <View
        style={{
          width: cardWidth,
          height: cardHeight,
        }}
      >
        {/* Background SVG */}
        <View className="absolute inset-0">
          <MatchCardBg
            width={cardWidth}
            height={cardHeight}
            predictionStatus={predictionStatus}
          />
        </View>

        {/* Date */}
        <View
          className="absolute left-0 right-0 z-10 items-center"
          style={{ top: dateTop }}
        >
          <View className="max-w-[85%] flex-row items-center justify-center gap-2">
            <CText
              className="max-w-[45%] text-[10px] font-medium text-muted"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {date}
            </CText>
            <View className="h-3 w-0.5 bg-border" />
            <CText
              className="max-w-[45%] text-[10px] font-medium text-muted"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {time}
            </CText>
          </View>
        </View>

        {/* Main content */}
        <View
          className="absolute left-0 right-0 flex-row items-center justify-center"
          style={{
            top: mainContentTop,
            height: contentHeight,
            paddingHorizontal: horizontalPadding,
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

          <View
            style={{ width: centerWidth }}
            className="items-center justify-center"
          >
            <CText
              className="text-2xl font-semibold text-text"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {scoreText}
            </CText>
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

        {/* Prediction */}
        <View
          className="absolute left-0 right-0 z-10 items-center"
          style={{ top: predictionTop }}
        >
          <CText
            className={`text-base font-semibold ${predictionTextClass}`}
            numberOfLines={1}
          >
            {predictionText}
          </CText>
        </View>
      </View>
    </Pressable>
  );
});
