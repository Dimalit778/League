import LeftJersey from '@/components/LeftJersey';
import { CText } from '@/components/ui';
import { MatchWithPredictions, PredictionMemberType, TeamType } from '@/features/matches/types';
import PredictionForm from '@/features/predictions/components/PredictionForm';
import { dateFormat, formatTime } from '@/utils/formats';
import { getTeamJersey } from '@/utils/teamColors';
import { Ionicons } from '@expo/vector-icons';
import { useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TeamCard({ team, badgeSize }: { team: TeamType; badgeSize: number }) {
  const shortName = team.shortName || team.name;
  const teamName = team.tla ?? shortName ?? team.name;
  const jerseyData = getTeamJersey(team.name);
  return (
    <View className="flex-1 items-center rounded-lg p-2 md:p-4 bg-gray-500/40  max-w-[130px] md:max-w-[180px] lg:max-w-[220px]">
      <View className="relative">
        <View className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-primary/10 rounded-full items-center justify-center mb-3">
          <LeftJersey teamName={teamName} jerseyColors={jerseyData} size={200} />
        </View>
      </View>
      <CText variant="body" className="text-white text-center">
        {shortName}
      </CText>
    </View>
  );
}

function TBDCard({ badgeSize }: { badgeSize: number }) {
  return (
    <View className="flex-1 items-center rounded-lg p-2 md:p-4 bg-gray-500/40 max-w-[130px] md:max-w-[180px] lg:max-w-[220px]">
      <View
        className="bg-white/10 rounded-full items-center justify-center mb-3"
        style={{ width: badgeSize, height: badgeSize }}
      >
        <Ionicons name="help" size={badgeSize * 0.45} color="rgba(255,255,255,0.4)" />
      </View>
      <CText variant="body" className="text-white/50 text-center">
        TBD
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
            <CText variant="caption" className="text-white">
              {dateFormat(match.kick_off)}
            </CText>
          </View>
          {venue ? (
            <View className="flex-row items-center mt-2 justify-center">
              <Ionicons name="location-outline" size={20} color="#fff" />
              <CText variant="caption" className="text-white">
                {venue}
              </CText>
            </View>
          ) : null}
        </View>
      </View>

      {/* Teams and Score Section */}
      <View className="flex-row items-center justify-evenly w-full mx-auto">
        {homeTeam ? <TeamCard team={homeTeam} badgeSize={badgeSize} /> : <TBDCard badgeSize={badgeSize} />}
        <ScoreCard
          homeScore={match.score?.fullTime?.home || 0}
          awayScore={match.score?.fullTime?.away || 0}
          matchStatus={match.status || ''}
          kick_off={match.kick_off}
        />
        {awayTeam ? <TeamCard team={awayTeam} badgeSize={badgeSize} /> : <TBDCard badgeSize={badgeSize} />}
      </View>
      {isScheduled && (
        <PredictionForm prediction={memberPrediction} matchId={match.id} />
      )}
    </View>
  );
}
