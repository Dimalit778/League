import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

const MATCH_CARD_COLORS = {
  cardTop: '#F8FAFC',
  cardBottom: '#EAF0F7',
  cardStroke: '#CBD5E1',

  dateBg: '#E2E8F0',
  dateStroke: '#CBD5E1',

  predictionTop: '#EAFBF2',
  predictionBottom: '#D7F5E5',
  predictionStroke: '#BFD8CF',

  shadow: '#000814',
};

type Props = {
  width: number;
  height: number;
};

export const MatchCardBg = ({ width, height }: Props) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 360 150">
      <Defs>
        <LinearGradient id="cardBg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={MATCH_CARD_COLORS.cardTop} />
          <Stop offset="1" stopColor={MATCH_CARD_COLORS.cardBottom} />
        </LinearGradient>

        <LinearGradient id="predictionBg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={MATCH_CARD_COLORS.predictionTop} />
          <Stop offset="1" stopColor={MATCH_CARD_COLORS.predictionBottom} />
        </LinearGradient>
      </Defs>

      {/* shadow */}
      <Rect x="8" y="10" width="344" height="132" rx="28" fill={MATCH_CARD_COLORS.shadow} opacity="0.1" />

      {/* main card */}
      <Path
        d="
          M 32 8
          H 125
          C 135 8 138 38 150 38
          H 210
          C 222 38 225 8 235 8
          H 328
          C 342 8 352 20 352 36
          V 112
          C 352 130 340 142 322 142
          H 235
          C 225 142 222 104 210 104
          H 150
          C 138 104 135 142 125 142
          H 32
          C 16 142 8 130 8 112
          V 36
          C 8 20 18 8 32 8
          Z
        "
        fill="url(#cardBg)"
        stroke={MATCH_CARD_COLORS.cardStroke}
        strokeWidth="1.3"
      />

      {/* top date tab */}
      <Path
        d="
          M 132 8
          H 228
          C 224 30 219 38 207 38
          H 153
          C 141 38 136 30 132 8
          Z
        "
        fill={MATCH_CARD_COLORS.dateBg}
        stroke={MATCH_CARD_COLORS.dateStroke}
        strokeWidth="1"
      />

      {/* bottom prediction tab */}
      <Path
        d="
          M 132 142
          C 136 114 141 104 153 104
          H 207
          C 219 104 224 114 228 142
          Z
        "
        fill="url(#predictionBg)"
        stroke={MATCH_CARD_COLORS.predictionStroke}
        strokeWidth="1"
      />
    </Svg>
  );
};
