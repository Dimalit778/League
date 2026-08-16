import { useLocalSearchParams } from 'expo-router';

import { Error, Screen } from '@/components';
import { Keyboard, Pressable, View } from 'react-native';
import MatchContent from '../components/match-details/MatchContent';
import MatchDetailsSkeleton from '../components/match-details/MatchDetailsSkeleton';
import MatchHero from '../components/match-details/MatchHero';
import { MatchHeroBackground } from '../components/match-details/effects/MatchHeroBackground';
import { PredictionSavedOverlay } from '../components/match-details/effects/PredictionSavedOverlay';
import { useGetMatchData } from '../hooks/useMatchData';
import { useMatchDetailsController } from '../hooks/useMatchDetailsController';
import type { MatchDetails } from '../types';

function LoadedMatchDetails({ match }: { match: MatchDetails }) {
  const controller = useMatchDetailsController(match);

  return (
    <Screen edges={['bottom']}>
      <Pressable
        className="mx-auto w-full flex-1 bg-background"
        style={{ maxWidth: controller.isTablet ? 768 : 512, backgroundColor: controller.colors.background }}
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <MatchHeroBackground height={controller.heroHeight} gradientColors={controller.heroGradientColors} />

        <View style={{ height: controller.heroHeight, paddingTop: controller.insets.top }}>
          <MatchHero
            match={match}
            memberPrediction={controller.memberPrediction}
            presentation={controller.presentation}
            onPredictionSaved={controller.showSuccess}
          />
        </View>

        <View className="-mt-3 min-h-0 flex-1 overflow-hidden rounded-t-3xl border border-border bg-background">
          <MatchContent match={match} canPredict={controller.presentation.canPredict} />
        </View>

        <PredictionSavedOverlay visible={controller.showSuccessAnimation} onComplete={controller.hideSuccess} />
      </Pressable>
    </Screen>
  );
}

const MatchDetailScreen = () => {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();

  const { data: matchData, isLoading, error } = useGetMatchData(Number(matchId));

  if (isLoading) return <MatchDetailsSkeleton />;
  if (error) return <Error error={error} />;
  if (!matchData) return <Error error={{ message: 'No match data found' }} />;

  return <LoadedMatchDetails match={matchData} />;
};

export default MatchDetailScreen;
