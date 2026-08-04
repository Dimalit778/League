import { Row } from '@/components/layout';
import { Button, Divider, MyImage, Text } from '@/components/ui';
import { MatchWithPredictions, PredictionWithMemberType, StatusType, TeamType } from '@/features/matches/types';
import PredictionForm, {
  type PredictionDraftState,
  type PredictionFormHandle,
} from '@/features/predictions/components/PredictionForm';
import { useTranslation } from '@/hooks/useTranslation';
import { dateFormat, formatTime } from '@/utils/formats';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { getMatchStatus } from '../../utils/matchStatus';

function TeamCard({ team, width, height }: { team: TeamType | null; width: number; height: number }) {
  if (!team) return <View className="flex-1" />;
  const shortName = team.shortName || team.name;
  return (
    <View className="min-w-0 flex-1 items-center justify-center gap-2" accessible accessibilityLabel={shortName}>
      <View style={{ width, height }} className="items-center justify-center overflow-hidden">
        <MyImage source={team.logo} width={width} height={height} contentFit="contain" />
      </View>
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
  homeScore: number | null;
  awayScore: number | null;
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
            {homeScore ?? '—'} : {awayScore ?? '—'}
          </Text>
        </Row>
      )}
      {['FINISHED'].includes(matchStatus) && (
        <View className="flex-row items-center justify-center rounded-xl border border-white/25 bg-black/20 px-4 py-2">
          <Text className="font-bold text-3xl text-white">{homeScore ?? '—'}</Text>
          <Text className="text-2xl mx-2 text-white/70">:</Text>
          <Text className="font-bold text-3xl text-white">{awayScore ?? '—'}</Text>
        </View>
      )}
    </View>
  );
}
function MatchDate({
  kickoff,
  venue,
  status,
}: {
  kickoff: string;
  venue: string | null | undefined;
  status: StatusType;
}) {
  const displayStatus = getMatchStatus(status);
  const isFinished = displayStatus === 'FINISHED';
  return (
    <View className="items-center pt-5">
      <Row className="min-w-24 rounded-full border border-border px-3 py-1.5 gap-1.5 justify-center">
        <Calendar size={14} color="#9ca3af" strokeWidth={2.2} />
        <Text variant="label" className="text-gray-400 font-semibold">
          {dateFormat(kickoff)}
        </Text>
        {!isFinished && (
          <>
            <Divider orientation="vertical" className="mx-1" />
            <Text variant="label" className="text-gray-400">
              {formatTime(kickoff)}
            </Text>
            <Clock size={14} color="#9ca3af" strokeWidth={1.6} />
          </>
        )}
      </Row>

      {venue && (
        <View className="flex-row items-center justify-center px-10">
          <MapPin size={15} color="#fff" strokeWidth={1.6} />
          <Text numberOfLines={1} className="text-xs ml-1 text-white/70">
            {venue}
          </Text>
        </View>
      )}
      {isFinished && (
        <View className="flex-row items-center justify-center bg-gray-500/50 px-3 mt-3 rounded-xl py-1">
          <Text variant="subtitle" className="text-white">
            FT
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
  onPredictionSaved?: () => void;
};

export default function MatchHeader({ match, memberPrediction, isScheduled, onPredictionSaved }: MatchHeaderProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const badgeSize = width >= 768 ? 100 : 68;
  const predictionFormRef = useRef<PredictionFormHandle>(null);
  const [draft, setDraft] = useState<PredictionDraftState>({ hasChanges: false, isPending: false });

  const handleDraftChange = useCallback((state: PredictionDraftState) => {
    setDraft(state);
  }, []);

  const homeTeam = match.home_team ?? null;
  const awayTeam = match.away_team ?? null;
  const venue = homeTeam?.venue;
  const status = match.status;

  return (
    <View className="flex-1 px-4 md:px-8">
      <MatchDate kickoff={match.kick_off} venue={venue} status={status} />
      <View className="flex-1 mt-8">
        <Row className="items-center justify-center">
          <TeamCard team={homeTeam} width={badgeSize} height={badgeSize} />

          <View className="w-32 items-center justify-center">
            {isScheduled ? (
              <PredictionForm
                ref={predictionFormRef}
                prediction={memberPrediction}
                matchId={match.id}
                onSaveSuccess={onPredictionSaved}
                onDraftChange={handleDraftChange}
              />
            ) : (
              <ScoreCard
                homeScore={match.score?.fullTime?.home ?? null}
                awayScore={match.score?.fullTime?.away ?? null}
                matchStatus={match.status || ''}
                kick_off={match.kick_off}
              />
            )}
          </View>

          <TeamCard team={awayTeam} width={badgeSize} height={badgeSize} />
        </Row>
        {isScheduled && (
          <View className="w-1/2 mx-auto px-4">
            {draft.hasChanges ? (
              <Button
                size="sm"
                label={t('Save')}
                variant="primary"
                onPress={() => void predictionFormRef.current?.save()}
                loading={draft.isPending}
                disabled={draft.isPending}
              />
            ) : (
              <View className="min-h-9 mt-3 items-center justify-center rounded-xl bg-black/50 px-3">
                <Text className="text-center font-semibold text-white">{t('Enter prediction')}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
