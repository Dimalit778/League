import { router, useLocalSearchParams } from 'expo-router';

import fieldImage from '@/assets/images/fieldImage.jpg';
import { Error, LoadingOverlay } from '@/components/layout';

import { usePrimaryMember } from '@/store/MemberStore';
import { AntDesign } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { TouchableOpacity, useWindowDimensions, View } from 'react-native';
import MatchContent from '../components/match-details/MatchContent';
import MatchHeader from '../components/match-details/MatchHeader';
import { useGetMatchDetail } from '../hooks/useMatches';

const MatchDetailScreen = () => {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { width } = useWindowDimensions();
  const isDesktop = width > 1024;
  const { memberId } = usePrimaryMember();

  const { data: matchData, isLoading, error } = useGetMatchDetail(Number(matchId));

  if (isLoading) return <LoadingOverlay />;
  if (error) return <Error error={error} />;
  if (!matchData) return <Error error={{ message: 'No match data found' }} />;

  const predictions = matchData.predictions ?? [];
  const memberPrediction = predictions.find((p) => p.league_member?.id === memberId);

  const now = new Date();
  const kickOff = new Date(matchData.kick_off);
  const isScheduled = ['SCHEDULED', 'TIMED'].includes(matchData.status ?? '') && kickOff > now;

  return (
    <View className="flex-1 w-full max-w-lg mx-auto bg-background">
      <View style={{ position: 'absolute', width: '100%', height: 400 }}>
        <ExpoImage
          source={fieldImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          priority="high"
          transition={0}
          style={{ width: '100%', height: '100%' }}
        />
        <View
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 400, backgroundColor: 'rgba(0,0,0,0.4)' }}
        ></View>
      </View>

      <TouchableOpacity className="absolute z-20 left-6 top-6 " onPress={() => router.dismiss()}>
        <AntDesign name="close-circle" size={isDesktop ? 40 : 30} color="#fff" />
      </TouchableOpacity>
      <MatchHeader match={matchData} memberPrediction={memberPrediction} isScheduled={isScheduled} />
      {/* Scrollable Content */}

      <View className="flex-1 bg-background border-t border-border rounded-t-3xl mt-16">
        <MatchContent match={matchData} isScheduled={isScheduled} />
      </View>
    </View>
  );
};

export default MatchDetailScreen;
