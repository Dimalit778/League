import { CText } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { hexToRgba } from '@/utils/colorHexToRgba';
import { formatTime } from '@/utils/formats';
import { Link } from 'expo-router';
import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { MatchWithPredictionsType } from '../../../types';
import { getMatchStatus, isMatchFinished, isMatchLive, isMatchScheduled } from '../../../utils/matchStatus';
import { getPredictionResultLabel } from '../../../utils/pointsColor';
import { PredictionDisplay } from '../../regular-league/MatchCardDisplay';
import TeamShirt from '../../TeamShirt';
type Props = { match: MatchWithPredictionsType };

/* ─── Score / time block ──────────────────────────────────────── */
function ScoreBlock({
  isFinished,
  isLive,
  isScheduled,
  homeScore,
  awayScore,
  kickOff,
}: {
  isFinished: boolean;
  isLive: boolean;
  isScheduled: boolean;
  homeScore: number | null;
  awayScore: number | null;
  kickOff: string;
}) {
  const { t } = useTranslation();

  if (isFinished) {
    return (
      <View className="px-2 items-center justify-center min-w-[72px]">
        <CText variant="h3" bold className="text-white tracking-tight">
          {homeScore != null && awayScore != null ? `${homeScore} - ${awayScore}` : '—'}
        </CText>
      </View>
    );
  }

  if (isLive) {
    return (
      <View className="px-2 items-center justify-center min-w-[72px] gap-1">
        <CText variant="small" bold className="text-success">
          {t('Live')}
        </CText>
        <CText variant="h3" bold className="text-text">
          {`${homeScore ?? 0} - ${awayScore ?? 0}`}
        </CText>
      </View>
    );
  }

  if (isScheduled) {
    return (
      <View className="px-2 items-center justify-center min-w-[72px]">
        <CText variant="h3" bold className="text-text">
          {formatTime(kickOff)}
        </CText>
      </View>
    );
  }

  return (
    <View className="px-2 min-w-[72px] items-center">
      <CText variant="h3" className="text-text/80">
        —
      </CText>
    </View>
  );
}

/* ─── Card header row (status badge) ─────────────────────────── */
function CardHeader({ isFinished, isLive }: { isFinished: boolean; isLive: boolean }) {
  const { t } = useTranslation();

  if (isFinished) {
    return (
      <View className="flex-row items-center px-2 py-1 bg-surface/18 border-b border-border">
        <View className="rounded-md px-2 py-1 bg-surface/7">
          <CText variant="small" bold className="text-text/40">
            FT
          </CText>
        </View>
      </View>
    );
  }

  if (isLive) {
    return (
      <View className="flex-row items-center gap-2 px-2 py-1 bg-surface/18 border-b border-border">
        <View className="w-2 h-2 rounded-sm bg-success" />
        <CText variant="small" bold className="text-success">
          {t('Live')}
        </CText>
      </View>
    );
  }

  return null;
}
function TeamRow({
  team,
  name,
  isHome,
}: {
  team?: MatchWithPredictionsType['home_team'];
  name?: string | null;
  isHome: boolean;
}) {
  return (
    <View className={`flex-1 flex-row items-center gap-2 min-w-0 ${isHome ? 'justify-end' : 'justify-start'}`}>
      {isHome ? (
        <>
          <CText variant="caption" numberOfLines={2} className="text-center">
            {name}
          </CText>
          <TeamShirt team={team} size={34} />
        </>
      ) : (
        <>
          <TeamShirt team={team} size={34} />
          <CText variant="caption" numberOfLines={2} className="text-center">
            {name}
          </CText>
        </>
      )}
    </View>
  );
}
/* ─── Match card ──────────────────────────────────────────────── */
export default memo(function GroupMatchCard({ match }: Props) {
  const { colors } = useThemeTokens();
  const matchStatus = getMatchStatus(match.status);
  const isFinished = isMatchFinished(matchStatus);
  const isLive = isMatchLive(matchStatus);
  const isScheduled = isMatchScheduled(matchStatus);

  const homeScore = match.score?.fullTime?.home ?? null;
  const awayScore = match.score?.fullTime?.away ?? null;

  const homeName = match.home_team?.name ?? '—';
  const awayName = match.away_team?.name ?? '—';
  const prediction = match.predictions?.[0];

  const predictionResult = getPredictionResultLabel(prediction?.points, prediction?.is_finished, isFinished);

  return (
    <View className="mb-2 w-full">
      <Link href={`/(app)/(member)/match/${match.id}`} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${homeName}, ${homeScore}-${awayScore}, ${awayName}`}
          className="w-full rounded-2xl overflow-hidden border border-border bg-surface "
          style={{
            ...(isFinished && { backgroundColor: hexToRgba(colors.surface, 0.4) }),
            ...(predictionResult ? { borderColor: predictionResult?.color } : { borderColor: colors.surface }),
          }}
        >
          {/* Status header */}
          <CardHeader isFinished={isFinished} isLive={isLive} />

          {/* Teams + score */}
          <View className="w-full flex-row items-center py-2 px-2">
            <TeamRow team={match.home_team} name={match.home_team?.name} isHome />

            <ScoreBlock
              isFinished={isFinished}
              isLive={isLive}
              isScheduled={isScheduled}
              homeScore={homeScore}
              awayScore={awayScore}
              kickOff={match.kick_off}
            />

            <TeamRow team={match.away_team} name={match.away_team?.name} isHome={false} />
          </View>

          {/* Prediction footer */}
          {prediction && <PredictionDisplay prediction={prediction} isFinished={isFinished} />}
        </Pressable>
      </Link>
    </View>
  );
});
