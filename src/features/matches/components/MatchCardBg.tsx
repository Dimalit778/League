import { PredictionDisplayStatus } from '@/features/matches/utils/matchCard.mapper';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

export const MATCH_CARD_VIEWBOX_WIDTH = 360;
export const MATCH_CARD_VIEWBOX_HEIGHT = 110;

// ponytail: shared silhouette so shadow keeps the prediction notch (plain Rect leaked a stripe under it)
const MATCH_CARD_PATH = `
  M 32 6
  H 108
  C 124 8 132 30 144 30
  H 216
  C 228 30 236 8 252 6
  H 328
  C 342 6 352 15 352 26
  V 82
  C 352 95 344 104 328 104
  H 240
  C 227 102 220 76 210 76
  H 150
  C 140 76 133 102 120 104
  H 32
  C 16 104 8 95 8 82
  V 26
  C 8 15 18 6 32 6
  Z
`;

const MATCH_CARD_HORIZONTAL_PADDING = 32;
const MATCH_CARD_HEIGHT_SCALE = 0.945;
const MATCH_CARD_GAP = 8;
const MATCH_CARD_CENTER_WIDTH = 82;
const MATCH_CARD_LOGO_MAX = 38;

export const MATCH_CARD_LAYOUT = {
  dateTabCenterY: 18 / MATCH_CARD_VIEWBOX_HEIGHT,
  predictionTabTopY: 76 / MATCH_CARD_VIEWBOX_HEIGHT,
  predictionTabHeight: 28 / MATCH_CARD_VIEWBOX_HEIGHT,
  contentTopY: 32 / MATCH_CARD_VIEWBOX_HEIGHT,
  contentBottomY: 76 / MATCH_CARD_VIEWBOX_HEIGHT,

  dateTabTextOffset: 8,
} as const;

export function getMatchCardMetrics(screenWidth: number) {
  const width = Math.min(screenWidth - MATCH_CARD_HORIZONTAL_PADDING, 640);

  const height = Math.round(width * (MATCH_CARD_VIEWBOX_HEIGHT / MATCH_CARD_VIEWBOX_WIDTH) * MATCH_CARD_HEIGHT_SCALE);

  const gap = MATCH_CARD_GAP;
  const centerWidth = MATCH_CARD_CENTER_WIDTH;

  const teamWidth = (width - centerWidth - gap * 2) / 2;

  const contentTop = height * MATCH_CARD_LAYOUT.contentTopY;

  const contentHeight = height * (MATCH_CARD_LAYOUT.contentBottomY - MATCH_CARD_LAYOUT.contentTopY);

  const headerTop = height * MATCH_CARD_LAYOUT.dateTabCenterY - MATCH_CARD_LAYOUT.dateTabTextOffset;

  const predictionTop = height * MATCH_CARD_LAYOUT.predictionTabTopY;
  const predictionHeight = height * MATCH_CARD_LAYOUT.predictionTabHeight;

  const logoBoxSize = Math.min(teamWidth * 0.65, height * 0.42, MATCH_CARD_LOGO_MAX);

  return {
    width,
    height,
    gap,
    centerWidth,
    teamWidth,
    contentTop,
    contentHeight,
    headerTop,
    predictionTop,
    predictionHeight,
    logoBoxSize,
  };
}

type Props = {
  width: number;
  height: number;
  predictionStatus?: PredictionDisplayStatus;
};

export function MatchCardBg({ width, height, predictionStatus = 'none' }: Props) {
  const { theme, colors } = useThemeTokens();
  const predictionColor =
    predictionStatus === 'correct' ? colors.success : predictionStatus === 'incorrect' ? colors.error : colors.border;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${MATCH_CARD_VIEWBOX_WIDTH} ${MATCH_CARD_VIEWBOX_HEIGHT}`}
      preserveAspectRatio="none"
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="match-card-background" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.surface} />

          <Stop offset="1" stopColor={colors.subtle} />
        </LinearGradient>

        <LinearGradient id="match-date-tab-background" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.surface} />

          <Stop offset="1" stopColor={colors.subtle} />
        </LinearGradient>

        <LinearGradient id="match-prediction-background" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.surface} />

          <Stop offset="1" stopColor={predictionColor} stopOpacity={predictionStatus === 'none' ? 0.5 : 0.22} />
        </LinearGradient>

        <LinearGradient id="match-card-highlight" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.text} stopOpacity={theme === 'dark' ? 0.08 : 0.025} />

          <Stop offset="0.42" stopColor={colors.text} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Shadow — same notch as card so it doesn't peek under the prediction tab */}
      <Path
        d={MATCH_CARD_PATH}
        transform="translate(1, 1.5)"
        fill={colors.text}
        opacity={theme === 'dark' ? 0.2 : 0.08}
      />

      {/* Main card */}
      <Path d={MATCH_CARD_PATH} fill="url(#match-card-background)" stroke={colors.border} strokeWidth="1.25" />

      {/* Subtle top highlight */}
      <Path
        d="
          M 32 7

          H 108
          C 124 9 132 30 144 30

          H 216
          C 228 30 236 9 252 7

          H 328
          C 340 7 348 14 351 23

          H 9
          C 12 14 20 7 32 7

          Z
        "
        fill="url(#match-card-highlight)"
      />

      {/* Date tab */}
      <Path
        d="
          M 115 9

          C 127 23 133 30 144 30

          H 216

          C 227 30 233 23 245 9

          Z
        "
        fill="url(#match-date-tab-background)"
        stroke={colors.border}
        strokeWidth="1.2"
      />

      {/* Prediction tab — bottom edge matches card notch (y=104) */}
      <Path
        d="
          M 120 104
          C 133 102 140 76 150 76
          H 210
          C 220 76 227 102 240 104
          Z
        "
        fill="url(#match-prediction-background)"
        stroke={predictionColor}
        strokeWidth="0.5"
      />
    </Svg>
  );
}
