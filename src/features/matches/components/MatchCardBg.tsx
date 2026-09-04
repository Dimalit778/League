import { useThemeTokens } from '@/hooks/useThemeTokens';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { MATCH_CARD_VIEWBOX_HEIGHT, MATCH_CARD_VIEWBOX_WIDTH } from './matchCardLayout';

/**
 * How the bottom prediction notch is painted:
 * - `none`    — blends into the card body (skeleton placeholder).
 * - `neutral` — same fill as the top date tab (before the match is settled).
 * - `bingo`   — gold tint  (exact score, 5 pts).
 * - `hit`     — green tint  (right outcome, 3 pts).
 * - `miss`    — red tint    (wrong, or no prediction submitted).
 */
export type PredictionTab = 'none' | 'neutral' | 'bingo' | 'hit' | 'miss';

const PREDICTION_TAB_PATH = `
  M 120 104
  C 133 102 140 76 150 76
  H 210
  C 220 76 227 102 240 104
  Z
`;

// ponytail: shared silhouette so shadow keeps the prediction notch (plain Rect leaked a stripe under it)
const MATCH_CARD_BODY = `
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

const MATCH_CARD_PATH = `
  M 32 6
  H 108
  C 124 8 132 30 144 30
  H 216
  C 228 30 236 8 252 6
  ${MATCH_CARD_BODY}
`;

const MATCH_CARD_HIGHLIGHT_PATH = `
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
`;

type Props = {
  width: number;
  height: number;
  predictionTab?: PredictionTab;
};

export function MatchCardBg({ width, height, predictionTab = 'none' }: Props) {
  const { theme, colors } = useThemeTokens();
  const isScored = predictionTab === 'bingo' || predictionTab === 'hit' || predictionTab === 'miss';
  const scoredColor =
    predictionTab === 'bingo' ? colors.gold : predictionTab === 'hit' ? colors.success : colors.error;
  const cardPath = MATCH_CARD_PATH;
  const highlightPath = MATCH_CARD_HIGHLIGHT_PATH;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${MATCH_CARD_VIEWBOX_WIDTH} ${MATCH_CARD_VIEWBOX_HEIGHT}`}
      preserveAspectRatio="none"
      style={{ pointerEvents: 'none' }}
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

        {isScored ? (
          <LinearGradient id="match-prediction-background" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.surface} />
            <Stop offset="1" stopColor={scoredColor} stopOpacity={theme === 'dark' ? 0.2 : 0.16} />
          </LinearGradient>
        ) : null}

        <LinearGradient id="match-card-highlight" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.text} stopOpacity={theme === 'dark' ? 0.08 : 0.025} />

          <Stop offset="0.42" stopColor={colors.text} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Shadow — same notch as card so it doesn't peek under the prediction tab */}
      <Path d={cardPath} fill={colors.text} />

      {/* Main card */}
      <Path d={cardPath} fill="url(#match-card-background)" stroke={colors.border} strokeWidth="1.25" />

      {/* Subtle top highlight */}
      <Path d={highlightPath} fill="url(#match-card-highlight)" />

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

      {/* Prediction tab — same notch as the card body */}
      {predictionTab === 'neutral' ? (
        <Path
          d={PREDICTION_TAB_PATH}
          fill="url(#match-date-tab-background)"
          stroke={colors.border}
          strokeWidth="1.2"
        />
      ) : isScored ? (
        <Path
          d={PREDICTION_TAB_PATH}
          fill="url(#match-prediction-background)"
          stroke={scoredColor}
          strokeOpacity={theme === 'dark' ? 0.4 : 0.45}
          strokeWidth="1"
        />
      ) : null}
    </Svg>
  );
}
