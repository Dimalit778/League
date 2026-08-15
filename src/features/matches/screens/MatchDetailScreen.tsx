import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { BackButton, Error, Screen } from '@/components';
import { DotLottie } from '@lottiefiles/dotlottie-react-native';

import { animations } from '@/assets/animations';
import { images } from '@/assets/images';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useMemberId } from '@/store/PrimaryLeagueStore';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Keyboard, Pressable, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MatchContent from '../components/match-details/MatchContent';
import MatchDetailsSkeleton from '../components/match-details/MatchDetailsSkeleton';
import MatchHeader from '../components/match-details/MatchHeader';
import { useGetMatchData } from '../hooks/useMatchData';

const MatchDetailScreen = () => {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();

  const memberId = useMemberId();
  const inset = useSafeAreaInsets();
  const { colors, isDark } = useThemeTokens();
  const { height, width, fontScale } = useWindowDimensions();
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const { data: matchData, isLoading, error } = useGetMatchData(Number(matchId));

  if (isLoading) return <MatchDetailsSkeleton />;
  if (error) return <Error error={error} />;
  if (!matchData) return <Error error={{ message: 'No match data found' }} />;

  const predictions = matchData.predictions ?? [];
  const memberPrediction = predictions.find((p) => p.league_member?.id === memberId);

  const now = new Date();
  const kickOff = new Date(matchData.kick_off);
  const hasStarted = kickOff <= now || ['IN_PLAY', 'PAUSED', 'FINISHED'].includes(matchData.status ?? '');
  const isScheduled = !hasStarted;
  const isTablet = width >= 768;
  const heroHeight = isScheduled
    ? Math.min(height * 0.46, Math.max(height * 0.43 + Math.max(0, fontScale - 1) * 72, isTablet ? 400 : 340))
    : Math.min(height * 0.4, Math.max(height * 0.38 + Math.max(0, fontScale - 1) * 72, isTablet ? 360 : 280));
  const heroGradientColors = isDark
    ? (['rgba(4,10,20,0.38)', 'rgba(4,10,20,0.5)', 'rgba(4,10,20,0.72)', colors.background] as const)
    : (['rgba(15,23,42,0.58)', 'rgba(15,23,42,0.44)', 'rgba(248,249,247,0.3)', colors.background] as const);

  return (
    <Screen edges={['bottom']}>
      <Pressable
        className="mx-auto w-full flex-1 bg-background"
        style={{ maxWidth: isTablet ? 768 : 512, backgroundColor: colors.background }}
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: heroHeight }}>
          <ExpoImage
            source={images.footballFieldBg}
            contentFit="cover"
            cachePolicy="memory-disk"
            priority="high"
            transition={0}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          />
          <LinearGradient
            colors={heroGradientColors}
            locations={[0, 0.45, 0.82, 1]}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          />
        </View>

        <View style={{ height: heroHeight, paddingTop: inset.top }}>
          <View className="absolute z-20  start-4" style={[{ top: inset.top }]}>
            <BackButton variant="onImage" onPress={() => router.dismiss()} />
          </View>

          <MatchHeader
            match={matchData}
            memberPrediction={memberPrediction}
            isScheduled={isScheduled}
            onPredictionSaved={() => setShowSuccessAnimation(true)}
          />
        </View>

        <View className="-mt-3 min-h-0 flex-1 overflow-hidden rounded-t-3xl border-t border-border bg-background">
          <MatchContent match={matchData} isScheduled={isScheduled} />
        </View>

        {showSuccessAnimation && (
          <View className="absolute inset-0 z-50 items-center justify-center bg-black/45" pointerEvents="none">
            <DotLottie
              source={animations.ball}
              autoplay
              loop={false}
              onComplete={() => setShowSuccessAnimation(false)}
              style={{ width: 300, height: 300 }}
            />
          </View>
        )}
      </Pressable>
    </Screen>
  );
};

export default MatchDetailScreen;
