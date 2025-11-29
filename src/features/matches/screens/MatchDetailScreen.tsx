import footballField from '@assets/images/footballField.png';

import { router, useLocalSearchParams } from 'expo-router';

import { Error, LoadingOverlay } from '@/components/layout';
import { AntDesign } from '@expo/vector-icons';
import { ImageBackground, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MatchContent from '../components/match/MatchContent';
import MatchHeader from '../components/match/MatchHeader';
import { useGetMatchDetail } from '../hooks/useMatches';

const MatchDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const { data: matchData, isLoading, error } = useGetMatchDetail(Number(id));

  if (isLoading) return <LoadingOverlay />;
  if (error) return <Error error={error} />;
  if (!matchData) return <Error error={{ message: 'No match data found' }} />;
  console.log('matchData', JSON.stringify(matchData, null, 2));

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

      <MatchContent match={matchData} />
    </View>
  );
};

export default MatchDetailScreen;
