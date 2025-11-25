import { MatchWithPredictionsAndMemberType } from '@/features/matches/types';
import { dateFormat, formatTime } from '@/utils/formats';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TeamCard({ logo, shortName }: { logo: string; shortName: string }) {
  return (
    <View className="flex-1 items-center rounded-lg p-2 bg-gray-500/40">
      <View className="relative">
        <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-3">
          <ExpoImage
            source={{ uri: logo }}
            style={{
              width: 64,
              height: 64,
            }}
            cachePolicy="memory-disk"
            contentFit="contain"
            transition={0}
            priority="high"
          />
        </View>
      </View>
      <Text className="text-white text-base font-bold text-center">{shortName}</Text>
    </View>
  );
}

function ScoreCard({
  homeScore,
  awayScore,
  matchStatus,
  kick_off,
}: {
  homeScore: number;
  awayScore: number;
  matchStatus: string;
  kick_off: string;
}) {
  return (
    <View className="mx-6">
      {['SCHEDULED', 'TIMED'].includes(matchStatus) && (
        <View className=" rounded-2xl p-4 items-center min-w-[100px]">
          <Ionicons name="time-outline" size={24} color="#fff" />
          <Text className="text-white text-sm mt-2 text-center">{formatTime(kick_off)}</Text>
        </View>
      )}
      {['IN_PLAY'].includes(matchStatus) && (
        <View className="items-center justify-center gap-2">
          <Text className="text-green-500 text-lg">LIVE</Text>
          <Text className="text-text text-3xl font-black">
            {homeScore} : {awayScore}
          </Text>
        </View>
      )}
      {['FINISHED'].includes(matchStatus) && (
        <View className="flex-row items-center border-2 border-gray-500 rounded-lg p-2">
          <Text className="text-white text-2xl font-black">{homeScore}</Text>
          <Text className="text-white text-2xl mx-2 font-bold">:</Text>
          <Text className="text-white text-2xl font-black">{awayScore}</Text>
        </View>
      )}
    </View>
  );
}

export default function MatchHeader({ match }: { match: MatchWithPredictionsAndMemberType }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top }}>
      <View className="p-4">
        <View className="items-center justify-center">
          <View className="flex-row items-center justify-center">
            <Ionicons name="calendar-outline" size={16} color="#fff" />
            <Text className="text-white ml-1 text-sm font-medium">{dateFormat(match.kick_off)}</Text>
          </View>
          {match.home_team.venue && (
            <View className="flex-row items-center mt-2 justify-center">
              <Ionicons name="location-outline" size={16} color="#fff" />
              <Text className="text-white ml-1 text-sm font-bold">{match.home_team.venue}</Text>
            </View>
          )}
        </View>
      </View>
      <View className="p-6">
        <View className="flex-row items-center justify-center">
          <TeamCard logo={match.home_team.logo} shortName={match.home_team?.shortName || ''} />
          <ScoreCard
            homeScore={match.score?.fullTime?.home || 0}
            awayScore={match.score?.fullTime?.away || 0}
            matchStatus={match.status || ''}
            kick_off={match.kick_off}
          />
          <TeamCard logo={match.away_team.logo} shortName={match.away_team?.shortName || ''} />
        </View>
      </View>
    </View>
  );
}
