import footballField from '@assets/images/footballField.png';

import { router, useLocalSearchParams } from 'expo-router';

import { Error, LoadingOverlay } from '@/components/layout';
import { useMemberStore } from '@/store/MemberStore';
import { AntDesign } from '@expo/vector-icons';
import { Dimensions, ImageBackground, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import MatchContent from '../components/match/MatchContent';
import MatchHeader from '../components/match/MatchHeader';
import { useGetMatchWithPredictions } from '../hooks/useMatches';

const { width } = Dimensions.get('window');

const MatchDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const leagueId = useMemberStore((s) => s.leagueId);

  const { data: matchData, isLoading, error } = useGetMatchWithPredictions(Number(id) || 0, leagueId || '');

  if (isLoading) return <LoadingOverlay />;
  if (error) return <Error error={error} />;
  if (!matchData) return <Error error={{ message: 'No match data found' }} />;

  return (
    <View className="flex-1 bg-background">
      <ImageBackground
        className="absolute top-0 left-0 right-0 w-full h-[350px] opacity-60"
        resizeMode={'cover'}
        source={footballField}
      />
      <TouchableOpacity
        className="absolute top-2 left-6"
        style={{ paddingTop: insets.top }}
        onPress={() => router.dismiss()}
      >
        <AntDesign name="close-circle" size={30} color="#fff" />
      </TouchableOpacity>
      <MatchHeader match={matchData} />
      <View className="flex-1 mt-10 bg-background">
        <Svg height={40} width={width} viewBox={`0 0 ${width} 40`} style={{ position: 'absolute', top: -40, left: 0 }}>
          <Path d={`M 0,40 Q ${width / 2},-15 ${width},40 L ${width},40 L 0,40 Z`} fill={'#0f172a'} />
        </Svg>
        <MatchContent match={matchData} />
      </View>
    </View>
  );
};

export default MatchDetailScreen;
