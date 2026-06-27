import { router } from 'expo-router';
import { memo } from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { CText } from '../../../components/ui/CText';
import { MatchCardBg } from './MatchCardBg';
type Team = {
  name: string;
  logo: ImageSourcePropType;
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
  date: string;
  time: string;
  onPress?: () => void;
};

function TeamBlock({ name, logo, width }: { name: string; logo: ImageSourcePropType; width: number }) {
  return (
    <View style={[styles.teamBox, { width }]}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />

      <CText className="text-center text-text " numberOfLines={1} ellipsizeMode="tail">
        {name}
      </CText>
    </View>
  );
}

export const MatchCard = memo(function MatchCard({ id, home, away, prediction, date, time, onPress }: MatchCardProps) {
  const { width: screenWidth } = useWindowDimensions();

  const cardWidth = screenWidth - 24;
  const cardHeight = 150;

  const centerWidth = 105;
  const sideWidth = (cardWidth - centerWidth) / 2;

  const hasScore = home.score !== null && home.score !== undefined && away.score !== null && away.score !== undefined;

  const hasPrediction =
    prediction?.home !== null &&
    prediction?.home !== undefined &&
    prediction?.away !== null &&
    prediction?.away !== undefined;

  const scoreText = hasScore ? `${home.score} - ${away.score}` : 'VS';
  const predictionText = hasPrediction ? `${prediction?.home} - ${prediction?.away}` : '- -';
  const accessibilityLabel = `${home.name}, ${scoreText}, ${away.name}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress ?? (() => router.push(`/(app)/(member)/match/${id}`))}
      className="w-full items-center py-3"
    >
      <View
        style={[
          styles.cardWrapper,
          {
            width: cardWidth,
            height: cardHeight,
          },
        ]}
      >
        <View style={StyleSheet.absoluteFill}>
          <MatchCardBg width={cardWidth} height={cardHeight} />
        </View>

        {/* Date */}
        <View style={styles.dateBox}>
          <CText className="text-[13px] font-bold text-slate-600" numberOfLines={1}>
            📅 {date} | {time}
          </CText>
        </View>

        {/* Main content */}
        <View style={styles.contentRow}>
          <TeamBlock name={home.name} logo={home.logo} width={sideWidth} />

          <View style={[styles.scoreBox, { width: centerWidth }]}>
            <CText className="text-center text-[46px] font-black text-slate-950" numberOfLines={1} adjustsFontSizeToFit>
              {scoreText}
            </CText>
          </View>

          <TeamBlock name={away.name} logo={away.logo} width={sideWidth} />
        </View>

        {/* Prediction */}
        <View style={styles.predictionBox}>
          <CText className="text-[11px] font-bold text-emerald-700">My prediction</CText>

          <CText className="mt-0.5 text-[24px] font-black text-emerald-700">{predictionText}</CText>
        </View>
      </View>
    </Pressable>
  );
});
const styles = StyleSheet.create({
  cardWrapper: {
    position: 'relative',

    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,

    elevation: 8,
  },

  contentRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 28,
    bottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
  },

  teamBox: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    overflow: 'hidden',
  },

  logo: {
    width: 58,
    height: 58,
  },

  teamName: {
    marginTop: 6,
    maxWidth: '100%',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    color: '#020617',
  },

  scoreBox: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },

  dateBox: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },

  predictionBox: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
});
