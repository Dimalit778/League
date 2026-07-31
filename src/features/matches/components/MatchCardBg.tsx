import { PredictionDisplayStatus } from '@/features/matches/utils/matchCard.mapper';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { ThemeName } from '@/lib/nativewind/nativeWind';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

export const MATCH_CARD_VIEWBOX_WIDTH = 360;
export const MATCH_CARD_VIEWBOX_HEIGHT = 110;

const MATCH_CARD_HORIZONTAL_PADDING = 32;
const MATCH_CARD_HEIGHT_SCALE = 0.945;
const MATCH_CARD_GAP = 8;
const MATCH_CARD_CENTER_WIDTH = 82;
const MATCH_CARD_LOGO_MAX = 38;

export const MATCH_CARD_LAYOUT = {
  dateTabCenterY: 18 / MATCH_CARD_VIEWBOX_HEIGHT,
  predictionTabCenterY: 88 / MATCH_CARD_VIEWBOX_HEIGHT,
  contentTopY: 32 / MATCH_CARD_VIEWBOX_HEIGHT,
  contentBottomY: 76 / MATCH_CARD_VIEWBOX_HEIGHT,

  dateTabTextOffset: 8,
  predictionTabTextOffset: 8,
} as const;

export function getMatchCardMetrics(screenWidth: number) {
  const width = screenWidth - MATCH_CARD_HORIZONTAL_PADDING;

  const height = Math.round(width * (MATCH_CARD_VIEWBOX_HEIGHT / MATCH_CARD_VIEWBOX_WIDTH) * MATCH_CARD_HEIGHT_SCALE);

  const gap = MATCH_CARD_GAP;
  const centerWidth = MATCH_CARD_CENTER_WIDTH;

  const teamWidth = (width - centerWidth - gap * 2) / 2;

  const contentTop = height * MATCH_CARD_LAYOUT.contentTopY;

  const contentHeight = height * (MATCH_CARD_LAYOUT.contentBottomY - MATCH_CARD_LAYOUT.contentTopY);

  const headerTop = height * MATCH_CARD_LAYOUT.dateTabCenterY - MATCH_CARD_LAYOUT.dateTabTextOffset;

  const predictionTop = height * MATCH_CARD_LAYOUT.predictionTabCenterY - MATCH_CARD_LAYOUT.predictionTabTextOffset;

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
    logoBoxSize,
  };
}

type GradientColors = {
  top: string;
  bottom: string;
  stroke: string;
};

type MatchCardColors = {
  card: GradientColors;
  dateTab: GradientColors;
  prediction: Record<PredictionDisplayStatus, GradientColors>;
  shadow: string;
  highlight: string;
};

const MATCH_CARD_COLORS: Record<ThemeName, MatchCardColors> = {
  light: {
    card: {
      top: '#FFFFFF',
      bottom: '#E7EDF5',
      stroke: '#C8D2DF',
    },

    dateTab: {
      top: '#F8FAFC',
      bottom: '#E2E8F0',
      stroke: '#CBD5E1',
    },

    shadow: '#020617',
    highlight: '#FFFFFF',

    prediction: {
      none: {
        top: '#F1F5F9',
        bottom: '#DCE4EE',
        stroke: '#94A3B8',
      },

      pending: {
        top: '#FFF4CE',
        bottom: '#EED58C',
        stroke: '#B7791F',
      },

      correct: {
        top: '#DCFCE7',
        bottom: '#BBF7D0',
        stroke: '#4ADE80',
      },

      incorrect: {
        top: '#FEE2E2',
        bottom: '#FECACA',
        stroke: '#F87171',
      },
    },
  },

  dark: {
    card: {
      top: '#253248',
      bottom: '#172235',
      stroke: '#3D4C64',
    },

    dateTab: {
      top: '#27344A',
      bottom: '#1D293D',
      stroke: '#44536B',
    },

    shadow: '#000000',
    highlight: '#FFFFFF',

    prediction: {
      none: {
        top: '#2B374B',
        bottom: '#1C2739',
        stroke: '#526079',
      },

      pending: {
        top: '#3D3319',
        bottom: '#28210F',
        stroke: '#D6A21E',
      },

      correct: {
        top: '#19372A',
        bottom: '#10231B',
        stroke: '#2F7D54',
      },

      incorrect: {
        top: '#3A1D21',
        bottom: '#241115',
        stroke: '#8A3942',
      },
    },
  },
};

type Props = {
  width: number;
  height: number;
  predictionStatus?: PredictionDisplayStatus;
};

export function MatchCardBg({ width, height, predictionStatus = 'none' }: Props) {
  const { theme } = useThemeTokens();

  const colors = MATCH_CARD_COLORS[theme];
  const predictionColors = colors.prediction[predictionStatus];

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
          <Stop offset="0" stopColor={colors.card.top} />

          <Stop offset="1" stopColor={colors.card.bottom} />
        </LinearGradient>

        <LinearGradient id="match-date-tab-background" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.dateTab.top} />

          <Stop offset="1" stopColor={colors.dateTab.bottom} />
        </LinearGradient>

        <LinearGradient id="match-prediction-background" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={predictionColors.top} />

          <Stop offset="1" stopColor={predictionColors.bottom} />
        </LinearGradient>

        <LinearGradient id="match-card-highlight" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.highlight} stopOpacity="0.12" />

          <Stop offset="0.42" stopColor={colors.highlight} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Shadow */}
      <Rect x="9" y="9" width="342" height="96" rx="22" fill={colors.shadow} opacity={theme === 'dark' ? 0.24 : 0.1} />

      {/* Main card */}
      <Path
        d="
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
        "
        fill="url(#match-card-background)"
        stroke={colors.card.stroke}
        strokeWidth="1.25"
      />

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
        stroke={colors.dateTab.stroke}
        strokeWidth="1.2"
      />

      {/* Prediction tab */}
      <Path
        d="
          M 126 101

          C 136 84 141 76 150 76

          H 210

          C 219 76 224 84 234 101

          Z
        "
        fill="url(#match-prediction-background)"
        stroke={predictionColors.stroke}
        strokeWidth="1.4"
      />
    </Svg>
  );
}
