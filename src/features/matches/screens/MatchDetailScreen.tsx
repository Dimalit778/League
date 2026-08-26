import { useLocalSearchParams } from 'expo-router';

import { Error, Screen } from '@/components';
import { View } from 'react-native';
import AiAnalysisCard from '../components/match-details/AiAnalysisCard';
import MatchDetailsSkeleton from '../components/match-details/MatchDetailsSkeleton';
import MatchDetailsTabs from '../components/match-details/MatchDetailsTabs';
import MatchHeader from '../components/match-details/MatchHeader';
import { useTranslation } from '@/hooks/useTranslation';
import { useGetMatchData } from '../hooks/useMatchData';
import { useMatchDetailsController } from '../hooks/useMatchDetailsController';
import type { MatchDetails } from '../types';

const HERO_BOTTOM = '#030812';
const gradientColors = ['rgba(4,8,20,0.92)', 'rgba(4,8,19,0.80)', 'rgba(3,8,18,0.92)', HERO_BOTTOM] as const;

function LoadedMatchDetails({ match, isPredictionsLoading }: { match: MatchDetails; isPredictionsLoading: boolean }) {
  const { t } = useTranslation();
  const controller = useMatchDetailsController(match);
  const canPredict = controller.presentation.canPredict;

  return (
    <Screen className="bg-[#030812]">
      <View
        className="mx-auto w-full flex-1"
        style={{ maxWidth: controller.isTablet ? 768 : 512, backgroundColor: HERO_BOTTOM }}
      >
        <MatchHeader
          match={match}
          memberPrediction={controller.memberPrediction}
          presentation={controller.presentation}
          onPredictionSaved={controller.showSuccess}
          gradientColors={gradientColors}
        />

        <View className="flex-1 overflow-hidden rounded-t-3xl bg-subtle ">
          {canPredict ? (
            <AiAnalysisCard match={match} title={t('AI Analysis')} />
          ) : (
            <MatchDetailsTabs match={match} isPredictionsLoading={isPredictionsLoading} />
          )}
        </View>
      </View>
    </Screen>
  );
}

const MatchDetailScreen = () => {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { data: match, isLoading, isFetching, isPlaceholderData, error } = useGetMatchData(Number(matchId));

  if (!match) {
    return isLoading ? <MatchDetailsSkeleton /> : <Error error={error ?? { message: 'No match data found' }} />;
  }

  return <LoadedMatchDetails match={match} isPredictionsLoading={Boolean(isPlaceholderData && isFetching)} />;
};

export default MatchDetailScreen;
