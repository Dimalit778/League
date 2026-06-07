import { CText } from '@/components/ui';
import TeamShirt from '@/features/matches/components/TeamShirt';
import { PredictionDisplay } from '@/features/matches/components/regular-league/MatchCardDisplay';
import { MatchWithPredictionsType } from '@/features/matches/types';
import { getMatchStatus, isMatchFinished, isMatchLive, isMatchScheduled } from '@/features/matches/utils/matchStatus';
import { getPredictionResultLabel } from '@/features/matches/utils/pointsColor';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { hexToRgba } from '@/utils/colorHexToRgba';
import { formatTime } from '@/utils/formats';
import { Link } from 'expo-router';
import { memo } from 'react';
import { Pressable, View } from 'react-native';
const TEAM_SHIRT_SIZE = 52;
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

/* ─── Match card ──────────────────────────────────────────────── */
export default memo(function Match({ match }: Props) {
  const { colors } = useThemeTokens();
  const matchStatus = getMatchStatus(match.status);
  const isFinished = isMatchFinished(matchStatus);
  const isLive = isMatchLive(matchStatus);
  const isScheduled = isMatchScheduled(matchStatus);
  const isWorldCup = match.competition_id === 2000;

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
            <View className="flex-1 flex-row items-center gap-2 min-w-0 justify-end">
              <CText variant="caption" numberOfLines={2} className="text-center">
                {match.home_team?.shortName}
              </CText>
              <TeamShirt team={match.home_team} size={TEAM_SHIRT_SIZE} />
            </View>

            <ScoreBlock
              isFinished={isFinished}
              isLive={isLive}
              isScheduled={isScheduled}
              homeScore={homeScore}
              awayScore={awayScore}
              kickOff={match.kick_off}
            />

            <View className="flex-1 flex-row items-center gap-2 min-w-0 justify-start ">
              <TeamShirt team={match.away_team} size={TEAM_SHIRT_SIZE} />
              <CText variant="caption" numberOfLines={2} className="text-center">
                {match.away_team?.shortName}
              </CText>
            </View>
          </View>

          {/* Prediction footer */}
          {prediction && <PredictionDisplay prediction={prediction} isFinished={isFinished} />}
        </Pressable>
      </Link>
    </View>
  );
});
