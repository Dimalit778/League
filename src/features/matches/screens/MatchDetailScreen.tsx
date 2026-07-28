import { router, useLocalSearchParams } from 'expo-router';

import { Error, LoadingOverlay } from '@/components/layout';

import { images } from '@/assets/images';
import { useMemberId } from '@/store/PrimaryLeagueStore';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MatchContent from '../components/match-details/MatchContent';
import MatchHeader from '../components/match-details/MatchHeader';
import { useGetMatchDetail } from '../hooks/useMatches';

const MatchDetailScreen = () => {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();

  const memberId = useMemberId();
  const inset = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const { data: matchData, isLoading, error } = useGetMatchDetail(Number(matchId));

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
    <View className="mx-auto w-full max-w-lg flex-1 bg-background">
      {/* Full-bleed hero bg — extends under the sheet so cover reaches top + MatchContent overlap */}
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
          className="absolute left-4 z-20 h-11 w-11 items-center justify-center border-2 border-text rounded-full"
          style={{ top: inset.top + 8 }}
          onPress={() => router.dismiss()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <ChevronLeft size={30} color="#fff" strokeWidth={1.6} />
        </TouchableOpacity>

        <MatchHeader match={matchData} memberPrediction={memberPrediction} isScheduled={isScheduled} />
      </View>

      <View className="-mt-5 flex-1 overflow-hidden rounded-t-3xl border-t border-border bg-background">
        <MatchContent match={matchData} isScheduled={isScheduled} />
      </View>
    </View>
  );
};

export default MatchDetailScreen;
