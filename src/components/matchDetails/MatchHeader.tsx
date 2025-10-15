import { formatTime } from '@/utils/match-utils';
import footballField from '@assets/images/footballField.png';

import { useThemeTokens } from '@/hooks/useThemeTokens';
import { MatchesWithTeamsType } from '@/types';
import { dateFormat } from '@/utils/formats';
import { ArrowLeftIcon } from '@assets/icons';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MatchHeader = ({ match }: { match: MatchesWithTeamsType }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeTokens();

  const { status } = match;

  const home = match.score_fulltime_home ?? '-';
  const away = match.score_fulltime_away ?? '-';

  return (
    <ImageBackground source={footballField} imageStyle={{ opacity: 0.4 }}>
      <View style={{ paddingTop: insets.top }}>
        <View className="p-4">
          <TouchableOpacity
            className="absolute top-2 left-4"
            onPress={() => router.back()}
          >
            <ArrowLeftIcon size={30} color={colors.text} />
          </TouchableOpacity>
          <View className="flex-row items-center justify-center">
            <Ionicons name="calendar-outline" size={16} color="#fff" />
            <Text className="text-white ml-1 text-sm font-medium">
              {dateFormat(match.kick_off)}
            </Text>
          </View>

          {match.home_team.venue && (
            <View className="flex-row items-center mt-2 justify-center">
              <Ionicons name="location-outline" size={16} color="#fff" />
              <Text className="text-white ml-1 text-sm font-bold">
                {match.home_team.venue}
              </Text>
            </View>
          )}
        </View>

        <View className="p-6">
          <View className="flex-row items-center ">
            {/* Home Team */}
            <View className="flex-1 items-center rounded-lg p-2 bg-gray-500/40">
              <View className="relative">
                <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-3">
                  <Image
                    source={{ uri: match.home_team.logo }}
                    className="w-16 h-16"
                    resizeMode="contain"
                  />
                </View>
              </View>
              <Text className="text-white text-base font-bold text-center">
                {match.home_team.shortName}
              </Text>
            </View>

            {/* Score */}
            <View className="mx-6">
              {['SCHEDULED', 'TIMED'].includes(status) && (
                <View className=" rounded-2xl p-4 items-center min-w-[100px]">
                  <Ionicons name="time-outline" size={24} color="#fff" />
                  <Text className="text-white text-sm mt-2 text-center">
                    {formatTime(match.kick_off)}
                  </Text>
                  <Text className="text-white text-sm mt-2 text-center">
                    {dateFormat(match.kick_off)}
                  </Text>
                </View>
              )}
              {['IN_PLAY'].includes(status) && (
                <View className="items-center justify-center gap-2">
                  <Text className="text-green-500 text-lg">LIVE</Text>
                  <Text className="text-text text-3xl font-black">
                    {match.score_fulltime_home} : {match.score_fulltime_away}
                  </Text>
                </View>
              )}
              {['FINISHED'].includes(status) && (
                <View className="flex-row items-center border-2 border-gray-500 rounded-lg p-2">
                  <Text className="text-white text-2xl font-black">
                    {match.score_fulltime_home}
                  </Text>
                  <Text className="text-white text-2xl mx-2 font-bold">:</Text>
                  <Text className="text-white text-2xl font-black">
                    {match.score_fulltime_away}
                  </Text>
                </View>
              )}
            </View>

            {/* Away Team */}
            <View className="flex-1 items-center rounded-lg p-2 bg-gray-500/40">
              <View className="relative">
                <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-3">
                  <Image
                    source={{ uri: match.away_team.logo }}
                    className="w-16 h-16"
                    resizeMode="contain"
                  />
                </View>
              </View>
              <Text className="text-white text-base font-bold text-center">
                {match.away_team.shortName}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default MatchHeader;
