import { PredictionDisplayStatus } from '@/features/matches/utils/matchCard.mapper';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { ThemeName } from '@/lib/nativeWind';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

export const MATCH_CARD_VIEWBOX_WIDTH = 360;
export const MATCH_CARD_VIEWBOX_HEIGHT = 110;

/** Layout anchors scaled from the original 360×150 design */
export const MATCH_CARD_LAYOUT = {
  dateTabCenterY: 22 / MATCH_CARD_VIEWBOX_HEIGHT,
  predictionTabCenterY: 88 / MATCH_CARD_VIEWBOX_HEIGHT,
  contentTopY: 34 / MATCH_CARD_VIEWBOX_HEIGHT,
  contentBottomY: 76 / MATCH_CARD_VIEWBOX_HEIGHT,
} as const;

type PredictionTabColors = {
  top: string;
  bottom: string;
  stroke: string;
};

type MatchCardColors = {
  cardTop: string;
  cardBottom: string;
  cardStroke: string;
  dateBg: string;
  dateStroke: string;
  shadow: string;
  prediction: Record<PredictionDisplayStatus, PredictionTabColors>;
};

const MATCH_CARD_COLORS: Record<ThemeName, MatchCardColors> = {
  light: {
    cardTop: '#F8FAFC',
    cardBottom: '#EAF0F7',
    cardStroke: '#CBD5E1',

    dateBg: '#E2E8F0',
    dateStroke: '#CBD5E1',

    shadow: '#000814',
    prediction: {
      none: { top: '#E2E8F0', bottom: '#CBD5E1', stroke: '#94A3B8' },
      pending: { top: '#E2E8F0', bottom: '#CBD5E1', stroke: '#94A3B8' },
      correct: { top: '#EAFBF2', bottom: '#D7F5E5', stroke: '#BFD8CF' },
      incorrect: { top: '#FEE2E2', bottom: '#FECACA', stroke: '#FCA5A5' },
    },
  },
  dark: {
    cardTop: '#243044',
    cardBottom: '#1a2332',
    cardStroke: '#334155',

    dateBg: '#1f2a3a',
    dateStroke: '#52647d',

    shadow: '#000000',
    prediction: {
      none: { top: '#2a3548', bottom: '#1e293b', stroke: '#475569' },
      pending: { top: '#2a3548', bottom: '#1e293b', stroke: '#475569' },
      correct: { top: '#162b22', bottom: '#111f19', stroke: '#1e4d36' },
      incorrect: { top: '#2b1618', bottom: '#1f1012', stroke: '#4d1e24' },
    },
  },
};

type Props = {
  width: number;
  height: number;
  predictionStatus?: PredictionDisplayStatus;
};

export const MatchCardBg = ({ width, height, predictionStatus = 'none' }: Props) => {
  const { theme } = useThemeTokens();
  const colors = MATCH_CARD_COLORS[theme];
  const predictionColors = colors.prediction[predictionStatus];

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${MATCH_CARD_VIEWBOX_WIDTH} ${MATCH_CARD_VIEWBOX_HEIGHT}`}
      preserveAspectRatio="none"
    >
      <Defs>
        <LinearGradient id="cardBg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.cardTop} />
          <Stop offset="1" stopColor={colors.cardBottom} />
        </LinearGradient>

        <LinearGradient id="predictionBg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={predictionColors.top} />
          <Stop offset="1" stopColor={predictionColors.bottom} />
        </LinearGradient>
      </Defs>

      {/* shadow */}
      <Rect x="8" y="7" width="344" height="97" rx="21" fill={colors.shadow} opacity="0.25" />

      {/* main card */}
      <Path
        d="
    M 32 6

    H 120
    C 133 7 140 28 150 28
    H 210
    C 220 28 227 7 240 6

    H 326
    C 342 6 352 15 352 26

    V 82
    C 352 95 340 104 322 104

H 240
C 227 102 220 76 210 76
H 150
C 140 76 133 102 120 104

    H 32
    C 16 104 8 95 8 82

    V 26
    C 8 15 18 6 32 6

    Z
  "
        fill="url(#cardBg)"
        stroke={colors.cardStroke}
        strokeWidth="1.3"
      />

      {/* top date tab - mirror of bottom prediction tab */}
      {/* top date tab - symmetric */}
      <Path
        d="
    M 125 7
    C 136 28 141 28 150 28
    H 210
    C 219 28 224 28 235 7
    Z
  "
        fill={colors.dateBg}
        stroke={colors.dateStroke}
        strokeWidth="1"
      />

      {/* bottom prediction tab */}
      <Path
        d="
    M 126 101
    C 136 84 141 76 150 76
    H 210
    C 219 76 224 84 234 101
    Z
  "
        fill="url(#predictionBg)"
        stroke={predictionColors.stroke}
        strokeWidth="1.5"
      />
    </Svg>
  );
};
