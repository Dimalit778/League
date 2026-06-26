import { CText, MyImage } from '@/components/ui';
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

function TeamRow({ name, logo }: { name: string; logo: string }) {
  return (
    <View className="min-w-0 flex-1 items-center px-1">
      <MyImage source={logo} width={40} height={40} contentFit="contain" />
      <CText variant="caption" numberOfLines={2} className="mt-1 text-center">
        {name}
      </CText>
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
  const homeLogo = match.home_team?.logo ?? '—';
  const awayLogo = match.away_team?.logo ?? '—';
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
          {/* Teams + score */}
          <View className="w-full flex-row items-center py-2 px-2">
            <TeamRow name={homeName} logo={homeLogo} />

            <ScoreBlock
              isFinished={isFinished}
              isLive={isLive}
              isScheduled={isScheduled}
              homeScore={homeScore}
              awayScore={awayScore}
              kickOff={match.kick_off}
            />

            <TeamRow name={awayName} logo={awayLogo} />
          </View>

          {/* Prediction footer */}
          {prediction && <PredictionDisplay prediction={prediction} isFinished={isFinished} />}
        </Pressable>
      </Link>
    </View>
  );
});
