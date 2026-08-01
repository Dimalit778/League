import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { Error, LoadingOverlay } from '@/components/layout';
import { Button } from '@/components/ui';
import { DotLottie } from '@lottiefiles/dotlottie-react-native';

import { animations } from '@/assets/animations';
import { images } from '@/assets/images';
import type { PredictionFormHandle } from '@/features/predictions/components/PredictionForm';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemberId } from '@/store/PrimaryLeagueStore';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import { Keyboard, Pressable, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MatchContent from '../components/match-details/MatchContent';
import MatchHeader from '../components/match-details/MatchHeader';
import { useGetMatchData } from '../hooks/useMatchData';

const MatchDetailScreen = () => {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { t } = useTranslation();

  const memberId = useMemberId();
  const inset = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const predictionFormRef = useRef<PredictionFormHandle>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [canSavePrediction, setCanSavePrediction] = useState(false);
  const [isSavingPrediction, setIsSavingPrediction] = useState(false);

  const handlePredictionDraftChange = useCallback(
    ({ hasChanges, isPending }: { hasChanges: boolean; isPending: boolean }) => {
      setCanSavePrediction(hasChanges);
      setIsSavingPrediction(isPending);
    },
    [],
  );

  const { data: matchData, isLoading, error } = useGetMatchData(Number(matchId));

  if (isLoading) return <LoadingOverlay />;
  if (error) return <Error error={error} />;
  if (!matchData) return <Error error={{ message: 'No match data found' }} />;

  const predictions = matchData.predictions ?? [];
  const memberPrediction = predictions.find((p) => p.league_member?.id === memberId);

  const now = new Date();
  const kickOff = new Date(matchData.kick_off);
  const hasStarted = kickOff <= now || ['IN_PLAY', 'PAUSED', 'FINISHED'].includes(matchData.status ?? '');
  const isScheduled = !hasStarted;

  return (
    <Pressable
      className="mx-auto w-full max-w-lg flex-1 bg-background"
      onPress={Keyboard.dismiss}
      accessible={false}
    >
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.35 }}>
        <ExpoImage
          source={images.footballFieldBg}
          contentFit="cover"
          cachePolicy="memory-disk"
          priority="high"
          transition={0}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />
        <LinearGradient
          colors={['rgba(4,10,20,0.38)', 'rgba(4,10,20,0.5)', 'rgba(4,10,20,0.72)']}
          locations={[0, 0.55, 1]}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />
      </View>

      <View style={{ height: height * 0.35, paddingTop: inset.top }}>
        <TouchableOpacity
          className="absolute left-4 z-20 h-11 w-11 items-center justify-center rounded-full border-2 border-text"
          style={{ top: inset.top + 8 }}
          onPress={() => router.dismiss()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <ChevronLeft size={30} color="#fff" strokeWidth={1.6} />
        </TouchableOpacity>

        <MatchHeader
          match={matchData}
          memberPrediction={memberPrediction}
          isScheduled={isScheduled}
          predictionFormRef={predictionFormRef}
          onPredictionDraftChange={handlePredictionDraftChange}
          onPredictionSaved={() => setShowSuccessAnimation(true)}
        />
      </View>

      <View className="-mt-5 min-h-0 flex-1 overflow-hidden rounded-t-3xl border-t border-border bg-background">
        <MatchContent match={matchData} isScheduled={isScheduled} />
      </View>

      {isScheduled && (
        <View
          className="border-t border-border bg-background px-4 pt-3"
          style={{ paddingBottom: Math.max(inset.bottom, 12) }}
        >
          <Button
            variant="primary"
            size="lg"
            fullWidth
            label={t('Save')}
            onPress={() => predictionFormRef.current?.save()}
            loading={isSavingPrediction}
            disabled={!canSavePrediction || isSavingPrediction}
          />
        </View>
      )}
      {showSuccessAnimation && (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black/45" pointerEvents="none">
          <DotLottie
            source={animations.success}
            autoplay
            loop={false}
            onComplete={() => setShowSuccessAnimation(false)}
            style={{ width: 180, height: 180 }}
          />
        </View>
      )}
    </Pressable>
  );
};

export default MatchDetailScreen;
