import { TeamBadge, Text } from '@/components/ui';
import { MatchWithPredictions, PredictionWithMemberType, TeamType } from '@/features/matches/types';
import PredictionForm from '@/features/predictions/components/PredictionForm';
import { dateFormat, formatTime } from '@/utils/formats';
import { Ionicons } from '@expo/vector-icons';
import { useWindowDimensions, View } from 'react-native';

function TeamCard({ team, width, height }: { team: TeamType; width: number; height: number }) {
  const shortName = team.shortName || team.name;
  return (
    <View className="min-w-0 flex-1 items-center px-1">
      <TeamBadge source={team.logo} width={width} height={height} />

      <Text semibold numberOfLines={2} className="mt-2 text-center text-white">
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
    <View className="w-32 items-center justify-center">
      {['SCHEDULED', 'TIMED'].includes(matchStatus) && (
        <View className="items-center rounded-2xl border border-white/20 bg-black/20 px-5 py-3">
          <Ionicons name="time-outline" size={20} color="#fff" />
          <Text semibold className="mt-1 text-center text-white">
            {formatTime(kick_off)}
          </Text>
        </View>
      )}
      {['IN_PLAY'].includes(matchStatus) && (
        <View className="items-center justify-center">
          <View className="mb-2 rounded-full bg-red-500/20 px-2.5 py-1">
            <Text small bold className="text-red-400">
              LIVE
            </Text>
          </View>
          <Text h2 bold className="text-white">
            {homeScore} : {awayScore}
          </Text>
        </View>
      )}
      {['FINISHED'].includes(matchStatus) && (
        <View className="flex-row items-center justify-center rounded-xl border border-white/25 bg-black/20 px-4 py-2">
          <Text bold h1 className="text-white">
            {homeScore}
          </Text>
          <Text h2 className="mx-2 text-white/70">
            :
          </Text>
          <Text bold h1 className="text-white">
            {awayScore}
          </Text>
        </View>
      )}
    </View>
  );
}

type MatchHeaderProps = {
  match: MatchWithPredictions;
  memberPrediction?: PredictionWithMemberType;
  isScheduled: boolean;
};

export default function MatchHeader({ match, memberPrediction, isScheduled }: MatchHeaderProps) {
  const { width } = useWindowDimensions();
  const badgeSize = width >= 768 ? 82 : 66;

  // Teams can be null for future knockout matches where opponents aren't decided yet
  const homeTeam = match.home_team ?? null;
  const awayTeam = match.away_team ?? null;
  const venue = homeTeam?.venue;

  return (
    <View className="flex-1 justify-center px-4 pt-10 pb-7">
      <View className="items-center">
        <View className="flex-row items-center rounded-full border border-white/15 bg-black/20 px-3 py-1.5">
          <Ionicons name="calendar-outline" size={16} color="#fff" />
          <Text small semibold className="ml-1.5 text-white">
            {dateFormat(match.kick_off)} · {formatTime(match.kick_off)}
          </Text>
        </View>

        {venue ? (
          <View className="mt-2 flex-row items-center justify-center px-10">
            <Ionicons name="location-outline" size={15} color="rgba(255,255,255,0.72)" />
            <Text small numberOfLines={1} className="ml-1 text-white/70">
              {venue}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mt-6 flex-row items-center justify-center">
        {homeTeam ? (
          <TeamCard team={homeTeam} width={badgeSize} height={badgeSize} />
        ) : (
          <View className="flex-1" />
        )}

        <View className="w-32 shrink-0 items-center justify-center">
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
        </View>

        {awayTeam ? (
          <TeamCard team={awayTeam} width={badgeSize} height={badgeSize} />
        ) : (
          <View className="flex-1" />
        )}
      </View>
    </View>
  );
}
