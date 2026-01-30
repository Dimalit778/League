import { CText } from '@/components/ui';
import { MatchWithPredictions } from '@/features/matches/types';
import { dateFormat, formatTime } from '@/utils/formats';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TeamCard({ logo, shortName }: { logo: string; shortName: string }) {
  return (
    <View className="flex-1 items-center rounded-lg p-2 md:p-4 bg-gray-500/40  max-w-[130px] md:max-w-[180px] lg:max-w-[220px]">
      <View className="relative">
        <View className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-primary/10 rounded-full items-center justify-center mb-3">
          <ExpoImage
            source={{ uri: logo }}
            style={{
              width: '100%',
              height: '100%',
            }}
            cachePolicy="memory-disk"
            contentFit="contain"
            transition={0}
            priority="high"
          />
        </View>
      </View>
      <CText variant="body" className="text-white text-center">
        {shortName}
      </CText>
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
    <View>
      {['SCHEDULED', 'TIMED'].includes(matchStatus) && (
        <View className="rounded-2xl p-4 md:p-6 items-center">
          <Ionicons name="time-outline" size={24} color="#fff" className="md:text-[32px]" />
          <CText variant="caption" className="text-white mt-2 text-center">
            {formatTime(kick_off)}
          </CText>
        </View>
      )}
      {['IN_PLAY'].includes(matchStatus) && (
        <View className="items-center justify-center gap-2">
          <CText variant="bodyBold" className="text-green-500">
            LIVE
          </CText>
          <CText variant="h3" className="text-white">
            {homeScore} : {awayScore}
          </CText>
        </View>
      )}
      {['FINISHED'].includes(matchStatus) && (
        <View className="flex-row items-center justify-center border-2 border-gray-500 rounded-lg p-2 md:p-3 gap-2">
          <CText variant="h3" className="text-white">
            {homeScore}
          </CText>
          <CText variant="h3" className="text-white">
            :
          </CText>
          <CText variant="h3" className="text-white">
            {awayScore}
          </CText>
        </View>
      )}
    </View>
  );
}

export default function MatchHeader({ match }: { match: MatchWithPredictions }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top }}>
      {/* Match Info Section */}
      <View className="p-4 mb-8">
        <View className="items-center justify-center">
          <View className="flex-row items-center justify-center gap-2">
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <CText variant="caption" className="text-white">
              {dateFormat(match.kick_off)}
            </CText>
          </View>
          {match.home_team.venue && (
            <View className="flex-row items-center mt-2 justify-center">
              <Ionicons name="location-outline" size={20} color="#fff" />
              <CText variant="caption" className="text-white">
                {match.home_team.venue}
              </CText>
            </View>
          )}
        </View>
      </View>

      {/* Teams and Score Section */}

      <View className="flex-row items-center justify-evenly w-full mx-auto">
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
  );
}
