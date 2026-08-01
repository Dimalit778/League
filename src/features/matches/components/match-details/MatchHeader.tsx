import { Row } from '@/components/layout';
import { Divider, MyImage, Text } from '@/components/ui';
import { MatchWithPredictions, PredictionWithMemberType, TeamType } from '@/features/matches/types';
import PredictionForm, {
  type PredictionDraftState,
  type PredictionFormHandle,
} from '@/features/predictions/components/PredictionForm';
import { dateFormat, formatTime } from '@/utils/formats';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import { RefObject } from 'react';
import { useWindowDimensions, View } from 'react-native';

function TeamCard({ team, width, height }: { team: TeamType | null; width: number; height: number }) {
  if (!team) return <View className="flex-1" />;
  const shortName = team.shortName || team.name;
  return (
    <View className="min-w-0 flex-1 items-center justify-center gap-2">
      <MyImage source={team.logo} width={width} height={height} />
      <Text variant="subtitle" numberOfLines={2} className="text-center text-white">
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
        <Row className="items-center rounded-2xl border border-white/20 bg-black/20 px-5 py-3">
          <Clock size={20} color="#fff" strokeWidth={1.6} />
          <Text variant="title" className="text-white">
            {formatTime(kick_off)}
          </Text>
        </Row>
      )}
      {['IN_PLAY'].includes(matchStatus) && (
        <Row className="items-center justify-center">
          <View className="mb-2 rounded-full bg-error/20 px-2.5 py-1">
            <Text className="text-xs font-bold text-error">LIVE</Text>
          </View>
          <Text className="text-2xl font-bold text-white">
            {homeScore} : {awayScore}
          </Text>
        </Row>
      )}
      {['FINISHED'].includes(matchStatus) && (
        <View className="flex-row items-center justify-center rounded-xl border border-white/25 bg-black/20 px-4 py-2">
          <Text className="font-bold text-3xl text-white">{homeScore}</Text>
          <Text className="text-2xl mx-2 text-white/70">:</Text>
          <Text className="font-bold text-3xl text-white">{awayScore}</Text>
        </View>
      )}
    </View>
  );
}

type MatchHeaderProps = {
  match: MatchWithPredictions;
  memberPrediction?: PredictionWithMemberType;
  isScheduled: boolean;
  onPredictionSaved?: () => void;
  predictionFormRef?: RefObject<PredictionFormHandle | null>;
  onPredictionDraftChange?: (state: PredictionDraftState) => void;
};

export default function MatchHeader({
  match,
  memberPrediction,
  isScheduled,
  onPredictionSaved,
  predictionFormRef,
  onPredictionDraftChange,
}: MatchHeaderProps) {
  const { width } = useWindowDimensions();
  const badgeSize = width >= 768 ? 100 : 68;

  // Teams can be null for future knockout matches where opponents aren't decided yet
  const homeTeam = match.home_team ?? null;
  const awayTeam = match.away_team ?? null;
  const venue = homeTeam?.venue;

  return (
    <View className="flex-1 px-4 mt-3 gap-5">
      <View className="items-center">
        <Row className="items-center rounded-full border border-white/15 bg-black/20 px-3 py-1.5 gap-1">
          <Calendar size={14} color="#9ca3af" strokeWidth={1.6} />
          <Text variant="label" className="text-gray-400">
            {dateFormat(match.kick_off)}
          </Text>
          <Divider orientation="vertical" className="mx-1" />
          <Text variant="label" className="text-gray-400">
            {formatTime(match.kick_off)}
          </Text>
          <Clock size={14} color="#9ca3af" strokeWidth={1.6} />
        </Row>

        {venue ? (
          <View className="flex-row items-center justify-center px-10">
            <MapPin size={15} color="#fff" strokeWidth={1.6} />
            <Text numberOfLines={1} className="text-xs ml-1 text-white/70">
              {venue}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mt-8 flex-row items-center justify-center">
        <TeamCard team={homeTeam} width={badgeSize} height={badgeSize} />

        <View className="w-32 items-center justify-center">
          {isScheduled ? (
            <PredictionForm
              ref={predictionFormRef}
              prediction={memberPrediction}
              matchId={match.id}
              onSaveSuccess={onPredictionSaved}
              onDraftChange={onPredictionDraftChange}
            />
          ) : (
            <ScoreCard
              homeScore={match.score?.fullTime?.home || 0}
              awayScore={match.score?.fullTime?.away || 0}
              matchStatus={match.status || ''}
              kick_off={match.kick_off}
            />
          )}
        </View>

        <TeamCard team={awayTeam} width={badgeSize} height={badgeSize} />
      </View>
    </View>
  );
}
