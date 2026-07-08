import { Text, TeamBadge } from '@/components/ui';
import { MatchWithPredictions, PredictionMemberType, TeamType } from '@/features/matches/types';
import PredictionForm from '@/features/predictions/components/PredictionForm';
import { dateFormat, formatTime } from '@/utils/formats';
import { Ionicons } from '@expo/vector-icons';
import { useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TeamCard({ team, width, height }: { team: TeamType; width: number; height: number }) {
  const shortName = team.shortName || team.name;
  return (
    <View className="flex-1 items-center rounded-lg p-2 md:p-4 bg-gray-500/40 max-w-[130px] md:max-w-[180px] lg:max-w-[220px]">
      <TeamBadge source={team.logo} width={width} height={height} />

      <Text variant="body" className="text-white text-center">
        {shortName}
      </Text>
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
          <Text variant="caption" className="text-white mt-2 text-center">
            {formatTime(kick_off)}
          </Text>
        </View>
      )}
      {['IN_PLAY'].includes(matchStatus) && (
        <View className="items-center justify-center gap-2">
          <Text variant="bodyBold" className="text-green-500">
            LIVE
          </Text>
          <Text variant="h3" className="text-white">
            {homeScore} : {awayScore}
          </Text>
        </View>
      )}
      {['FINISHED'].includes(matchStatus) && (
        <View className="flex-row items-center justify-center border-2 border-gray-500 rounded-lg p-2 md:p-3 gap-2">
          <Text variant="h3" className="text-white">
            {homeScore}
          </Text>
          <Text variant="h3" className="text-white">
            :
          </Text>
          <Text variant="h3" className="text-white">
            {awayScore}
          </Text>
        </View>
      )}
    </View>
  );
}

type MatchHeaderProps = {
  match: MatchWithPredictions;
  memberPrediction?: PredictionMemberType;
  isScheduled: boolean;
};

export default function MatchHeader({ match, memberPrediction, isScheduled }: MatchHeaderProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const badgeSize = width >= 1024 ? 96 : width >= 768 ? 80 : 64;

  // Teams can be null for future knockout matches where opponents aren't decided yet
  const homeTeam = match.home_team ?? null;
  const awayTeam = match.away_team ?? null;
  const venue = homeTeam?.venue;

  return (
    <View style={{ paddingTop: insets.top }}>
      {/* Match Info Section */}
      <View className="p-4 mb-8">
        <View className="items-center justify-center">
          <View className="flex-row items-center justify-center gap-2">
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <Text variant="caption" className="text-white">
              {dateFormat(match.kick_off)}
            </Text>
          </View>
          {venue ? (
            <View className="flex-row items-center mt-2 justify-center">
              <Ionicons name="location-outline" size={20} color="#fff" />
              <Text variant="caption" className="text-white">
                {venue}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Teams and Score Section */}
      <View className="flex-row items-center justify-evenly w-full mx-auto">
        {homeTeam ? <TeamCard team={homeTeam} width={badgeSize} height={badgeSize} /> : <View className="flex-1" />}
        {isScheduled ? (
          <PredictionForm prediction={memberPrediction} matchId={match.id} />
        ) : (
          <ScoreCard
            homeScore={match.score?.fullTime?.home || 0}
            awayScore={match.score?.fullTime?.away || 0}
            matchStatus={match.status || ''}
            kick_off={match.kick_off}
          />
        )}
        {awayTeam ? <TeamCard team={awayTeam} width={badgeSize} height={badgeSize} /> : <View className="flex-1" />}
      </View>
    </View>
  );
}
