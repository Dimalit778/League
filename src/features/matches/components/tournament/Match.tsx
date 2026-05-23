import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { formatTime } from '@/utils/formats';
import { Link } from 'expo-router';
import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { MatchWithPredictionsType } from '../../types';
import { getMatchStatus, isMatchFinished, isMatchLive, isMatchScheduled } from '../../utils/matchStatus';
import TeamBadge from '../TeamBadge';

const CARD = {
  bg: '#161b22',
  border: 'rgba(255,255,255,0.06)',
  badgeBg: '#2d333b',
  headerBg: 'rgba(0,0,0,0.18)',
  divider: 'rgba(255,255,255,0.05)',
} as const;

type Props = { match: MatchWithPredictionsType };

type Prediction = MatchWithPredictionsType['predictions'][number];

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
        <CText variant="small" bold className="text-emerald-400">
          {t('Live')}
        </CText>
        <CText variant="h3" bold className="text-white">
          {`${homeScore ?? 0} - ${awayScore ?? 0}`}
        </CText>
      </View>
    );
  }

  if (isScheduled) {
    return (
      <View className="px-2 items-center justify-center min-w-[72px]">
        <CText variant="h3" bold className="text-white">
          {formatTime(kickOff)}
        </CText>
      </View>
    );
  }

  return (
    <View className="px-2 min-w-[72px] items-center">
      <CText variant="h3" className="text-white/80">
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
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10,
          paddingVertical: 5,
          backgroundColor: CARD.headerBg,
          borderBottomWidth: 1,
          borderBottomColor: CARD.divider,
        }}
      >
        <View
          style={{
            borderRadius: 4,
            paddingHorizontal: 6,
            paddingVertical: 2,
            backgroundColor: 'rgba(255,255,255,0.07)',
          }}
        >
          <CText variant="small" bold style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 0.5 }}>
            FT
          </CText>
        </View>
      </View>
    );
  }

  if (isLive) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          paddingHorizontal: 10,
          paddingVertical: 5,
          backgroundColor: CARD.headerBg,
          borderBottomWidth: 1,
          borderBottomColor: CARD.divider,
        }}
      >
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' }} />
        <CText variant="small" bold style={{ color: '#4ade80', fontSize: 10, letterSpacing: 0.5 }}>
          {t('Live')}
        </CText>
      </View>
    );
  }

  return null;
}

/* ─── Prediction footer ───────────────────────────────────────── */
function PredictionFooter({
  prediction,
  isMatchFinished: finished,
}: {
  prediction: Prediction | undefined;
  isMatchFinished: boolean;
}) {
  const { t } = useTranslation();

  if (!prediction) {
    // No prediction made — show a subtle placeholder only for unplayed matches
    if (finished) return null;
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 6,
          borderTopWidth: 1,
          borderTopColor: CARD.divider,
          gap: 4,
        }}
      >
        <CText variant="small" style={{ color: 'rgba(255,255,255,0.22)', fontSize: 11 }}>
          {t('No prediction')}
        </CText>
      </View>
    );
  }

  const scored = prediction.is_finished && finished;
  const won = scored && prediction.points > 0;
  const lost = scored && !won;

  const bgColor = won ? 'rgba(74,222,128,0.09)' : lost ? 'rgba(248,113,113,0.07)' : 'transparent';

  const textColor = won ? '#4ade80' : lost ? '#f87171' : 'rgba(255,255,255,0.5)';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 8,
        backgroundColor: bgColor,
        borderTopWidth: 1,
        borderTopColor: CARD.divider,
      }}
    >
      {/* Label */}
      <CText variant="small" style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11 }}>
        {t('Prediction')}:
      </CText>

      {/* Predicted score */}
      <CText variant="small" bold style={{ color: textColor, fontSize: 12 }}>
        {prediction.home_score} – {prediction.away_score}
      </CText>

      {/* Points badge — only when scored */}
      {scored && (
        <View
          style={{
            borderRadius: 5,
            paddingHorizontal: 7,
            paddingVertical: 2,
            backgroundColor: won ? 'rgba(74,222,128,0.18)' : 'rgba(248,113,113,0.14)',
          }}
        >
          <CText variant="small" bold style={{ color: textColor, fontSize: 11 }}>
            {won ? `+${prediction.points}` : '0'} {t('pts')}
          </CText>
        </View>
      )}
    </View>
  );
}

/* ─── Match card ──────────────────────────────────────────────── */
export default memo(function Match({ match }: Props) {
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

  return (
    <View className="mb-2">
      <Link href={`/(app)/(member)/match/${match.id}`} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${homeName}, ${homeScore}-${awayScore}, ${awayName}`}
          className="rounded-2xl overflow-hidden border"
          style={{ backgroundColor: CARD.bg, borderColor: CARD.border }}
        >
          {/* Status header */}
          <CardHeader isFinished={isFinished} isLive={isLive} />

          {/* Teams + score */}
          <View className="flex-1 flex-row items-center py-2 px-2">
            <View className="flex-1 flex-row items-center gap-2 min-w-0 justify-end">
              <CText variant="caption" numberOfLines={2} className="text-center">
                {match.home_team?.shortName}
              </CText>
              <TeamBadge team={match.home_team} isWorldCup={isWorldCup} />
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
              <TeamBadge team={match.away_team} isWorldCup={isWorldCup} />
              <CText variant="caption" numberOfLines={2} className="text-center">
                {match.away_team?.shortName}
              </CText>
            </View>
          </View>

          {/* Prediction footer */}
          <PredictionFooter prediction={prediction} isMatchFinished={isFinished} />
        </Pressable>
      </Link>
    </View>
  );
});
