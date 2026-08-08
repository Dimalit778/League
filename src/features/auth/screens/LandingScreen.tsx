import { images } from '@/assets/images';
import { Brand, Button, Screen, Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Check, Crown, Trophy } from 'lucide-react-native';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

const GOLD = '#FFB31A';
const CARD_BACKGROUND = 'rgba(5, 18, 37, 0.90)';
const CARD_BORDER = 'rgba(255, 202, 85, 0.58)';

function PredictionCard({ compact }: { compact: boolean }) {
  const { t } = useTranslation();

  return (
    <View
      className="absolute left-0 z-20 w-[58%] overflow-hidden rounded-[22px] border p-3"
      style={[
        styles.previewCard,
        { borderColor: CARD_BORDER, backgroundColor: CARD_BACKGROUND },
        compact ? styles.predictionCardCompact : styles.predictionCard,
      ]}
    >
      <LinearGradient
        colors={['rgba(255,179,26,0.14)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.85 }}
        style={[StyleSheet.absoluteFill, styles.nonInteractive]}
      />
      <Text className="text-center text-[13px] font-bold text-white">{t('My prediction')}</Text>
      <View className="mt-2 flex-row items-center justify-center gap-2" style={{ direction: 'ltr' }}>
        <View className="size-10 items-center justify-center rounded-full border border-[#75A7FF]/60 bg-[#153A6A]">
          <Text className="text-center text-lg font-black text-white">B</Text>
        </View>
        <Text className="text-center text-xs font-bold text-[#9DAAC1]">VS</Text>
        <View className="size-10 items-center justify-center rounded-full border border-[#FFB31A]/60 bg-[#543A10]">
          <Text className="text-center text-lg font-black text-white">G</Text>
        </View>
      </View>
      <View className="mt-2 items-center">
        <Text className="text-center text-[11px] font-semibold text-[#FFCB5B]">{t('Predicted score')}</Text>
        <View className="mt-1 min-w-[92px] rounded-xl border border-[#FFB31A]/70 bg-[#06101F]/80 px-3 py-1">
          <Text allowFontScaling={false} className="text-center font-teko-bold text-[34px] leading-[38px] text-white">
            2 - 1
          </Text>
        </View>
        <View className="-mt-2 size-8 items-center justify-center rounded-full border border-[#FFD36B] bg-[#D99511]">
          <Check size={20} color="#081322" strokeWidth={3} />
        </View>
      </View>
    </View>
  );
}

const leaders = [
  { rank: '1', initial: 'Y', name: 'Yosi', points: '2,350', color: '#E9AC23' },
  { rank: '2', initial: 'N', name: 'Noa', points: '2,120', color: '#A6B1C4' },
  { rank: '3', initial: 'A', name: 'Amit', points: '1,980', color: '#C7824A' },
] as const;

function LeaderboardCard({ compact }: { compact: boolean }) {
  const { t } = useTranslation();

  return (
    <View
      className="absolute right-0 z-10 w-[57%] overflow-hidden rounded-[22px] border px-3 pb-3 pt-2"
      style={[
        styles.previewCard,
        { borderColor: 'rgba(134, 168, 222, 0.58)', backgroundColor: CARD_BACKGROUND },
        compact ? styles.leaderboardCardCompact : styles.leaderboardCard,
      ]}
    >
      <LinearGradient
        colors={['rgba(69,119,190,0.17)', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.nonInteractive]}
      />
      <View className="mb-1 flex-row items-center justify-center gap-2" style={{ direction: 'ltr' }}>
        <Text className="text-center text-[13px] font-bold text-white">{t('Leaderboard')}</Text>
        <Trophy size={16} color={GOLD} fill={GOLD} strokeWidth={1.6} />
      </View>
      {leaders.map((leader, index) => (
        <View
          key={leader.rank}
          className="flex-row items-center gap-1.5 border-b border-white/10 py-1.5 last:border-b-0"
          style={{ direction: 'ltr' }}
        >
          <View className="size-5 items-center justify-center rounded-full" style={{ backgroundColor: leader.color }}>
            <Text allowFontScaling={false} className="text-center text-[10px] font-black text-[#071525]">
              {leader.rank}
            </Text>
          </View>
          <View className="size-7 items-center justify-center rounded-full border border-white/30 bg-[#172B46]">
            {index === 0 && <Crown size={12} color={GOLD} fill={GOLD} style={styles.crown} />}
            <Text allowFontScaling={false} className="text-center text-[11px] font-bold text-white">
              {leader.initial}
            </Text>
          </View>
          <View className="min-w-0 flex-1">
            <Text numberOfLines={1} className="text-[11px] font-bold leading-4 text-white">
              {leader.name}
            </Text>
            <Text allowFontScaling={false} className="text-[10px] leading-3 text-[#AAB7CB]">
              {leader.points}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function ProductPreview({ compact }: { compact: boolean }) {
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      className="relative w-full"
      style={{ height: compact ? 178 : 220 }}
    >
      <View style={styles.previewGlow} />
      <PredictionCard compact={compact} />
      <LeaderboardCard compact={compact} />
    </View>
  );
}

export default function LandingScreen() {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const compact = height < 740;

  return (
    <View className="flex-1 bg-[#030B18]">
      <ImageBackground
        source={images.bgWelcome}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
        accessibilityIgnoresInvertColors
      />
      <LinearGradient
        colors={['rgba(1,8,20,0.22)', 'rgba(1,9,22,0.45)', 'rgba(2,8,18,0.96)']}
        locations={[0, 0.52, 1]}
        style={[StyleSheet.absoluteFill, styles.nonInteractive]}
      />
      <Screen
        padding="horizontal"
        edges={['top', 'bottom']}
        className="bg-transparent"
        contentClassName="bg-transparent"
      >
        <View className="flex-1 py-3 gap-5">
          <Brand size="lg" onBoarding />

          <ProductPreview compact={compact} />

          <View className="mt-1 items-center">
            <Text
              accessibilityRole="header"
              className="text-center font-teko-bold text-[36px] leading-[40px] text-white"
              maxFontSizeMultiplier={1.35}
            >
              {t('Every match is a challenge')}
            </Text>
            <View className="mt-2 h-1 w-12 rounded-full bg-[#FFB31A]" />
            <Text
              className="mt-3 max-w-[340px] text-center text-[15px] leading-[21px] text-[#B6C0D2]"
              maxFontSizeMultiplier={1.35}
            >
              {t('Predict scores, compete with friends, and climb the table.')}
            </Text>
          </View>

          <View className="mt-auto gap-2 pt-3">
            <Link href="/(auth)/signUp" asChild>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                accessibilityLabel={t('Get Started')}
                accessibilityHint={t('Create your Champo account')}
                className="min-h-[58px] rounded-2xl border border-[#FFD566] bg-[#FFB31A] shadow-lg shadow-black/40"
              >
                <Text className="text-center text-xl font-black text-[#081322]">{t('Get Started')}</Text>
              </Button>
            </Link>

            <View className="flex-row items-center justify-center gap-1" style={{ direction: 'ltr' }}>
              <Text className="text-center text-sm text-[#AAB4C6]">{t('Already have an account?')}</Text>
              <Link href="/(auth)/signIn" asChild>
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={t('Sign In')}
                  hitSlop={10}
                  className="rounded-lg px-1 py-2 active:opacity-70"
                >
                  <Text className="text-center text-sm font-bold text-[#7EA1FF]">{t('Sign In')}</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  nonInteractive: { pointerEvents: 'none' },
  logoBall: { width: 46, height: 46 },
  logoSparkle: { position: 'absolute', right: -9, top: -7 },
  previewCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12,
  },
  predictionCard: { top: 0, minHeight: 204, transform: [{ rotate: '-1.5deg' }] },
  predictionCardCompact: { top: 0, minHeight: 170, transform: [{ rotate: '-1.5deg' }, { scale: 0.96 }] },
  leaderboardCard: { top: 20, minHeight: 188, transform: [{ rotate: '1.5deg' }] },
  leaderboardCardCompact: { top: 10, minHeight: 164, transform: [{ rotate: '1.5deg' }, { scale: 0.96 }] },
  crown: { position: 'absolute', top: -8 },
  previewGlow: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    bottom: 4,
    height: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 179, 26, 0.22)',
    shadowColor: GOLD,
    shadowOpacity: 0.75,
    shadowRadius: 24,
  },
});
